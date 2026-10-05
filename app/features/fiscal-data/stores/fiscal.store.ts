import { defineStore } from 'pinia'
import type { FiscalRequest } from '../schemas'
import { useFiscalApi } from '../services'
import type { FiscalProfile } from '../types'

const byDefaultFirst = (a: FiscalProfile, b: FiscalProfile) =>
  Number(b.isDefault) - Number(a.isDefault) || a.createdAt.localeCompare(b.createdAt)

/** Perfiles de facturacion del cliente (sin limite, sin paginar). */
export const useFiscalStore = defineStore('customer-fiscal', () => {
  const api = useFiscalApi()
  const items = ref<FiscalProfile[]>([])
  const loaded = ref(false)
  const pending = ref(false)
  const error = ref<string | null>(null)

  const sorted = computed(() => [...items.value].sort(byDefaultFirst))
  const defaultProfile = computed(() => items.value.find(p => p.isDefault) ?? null)

  async function load() {
    pending.value = true
    error.value = null
    try {
      items.value = await api.list()
      loaded.value = true
    }
    catch (e) {
      error.value = parseApiError(e).message
    }
    finally {
      pending.value = false
    }
  }

  function ensureLoaded() {
    return loaded.value ? Promise.resolve() : load()
  }

  function apply(saved: FiscalProfile) {
    const others = items.value
      .filter(p => p.id !== saved.id)
      .map(p => (saved.isDefault && p.isDefault ? { ...p, isDefault: false } : p))
    items.value = [...others, saved]
  }

  async function create(body: FiscalRequest) {
    const saved = await api.create({ ...body, isDefault: body.isDefault || !items.value.length })
    apply(saved)
    return saved
  }

  async function update(id: string, body: FiscalRequest) {
    const saved = await api.update(id, body)
    apply(saved)
    return saved
  }

  async function setDefault(id: string) {
    apply(await api.setDefault(id))
  }

  async function remove(id: string) {
    await api.remove(id)
    items.value = items.value.filter(p => p.id !== id)
  }

  function $reset() {
    items.value = []
    loaded.value = false
    error.value = null
  }

  return { items, sorted, defaultProfile, loaded, pending, error, load, ensureLoaded, create, update, setDefault, remove, $reset }
})
