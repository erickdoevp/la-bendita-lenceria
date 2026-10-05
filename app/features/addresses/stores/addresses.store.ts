import { defineStore } from 'pinia'
import { MAX_ADDRESSES } from '../constants'
import type { AddressRequest } from '../schemas'
import { useAddressesApi } from '../services'
import type { Address } from '../types'

/** La predeterminada primero; el resto por fecha de alta. */
const byDefaultFirst = (a: Address, b: Address) =>
  Number(b.isDefault) - Number(a.isDefault) || a.createdAt.localeCompare(b.createdAt)

/** Direcciones del cliente (max. 5, sin paginar). Tambien las usa el checkout. */
export const useAddressesStore = defineStore('customer-addresses', () => {
  const api = useAddressesApi()
  const items = ref<Address[]>([])
  const loaded = ref(false)
  const pending = ref(false)
  const error = ref<string | null>(null)

  const sorted = computed(() => [...items.value].sort(byDefaultFirst))
  const defaultAddress = computed(() => items.value.find(a => a.isDefault) ?? null)
  const isFull = computed(() => items.value.length >= MAX_ADDRESSES)

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

  /** Marcar una como predeterminada desmarca la anterior en el backend. */
  function apply(saved: Address) {
    const others = items.value
      .filter(a => a.id !== saved.id)
      .map(a => (saved.isDefault && a.isDefault ? { ...a, isDefault: false } : a))
    items.value = [...others, saved]
  }

  async function create(body: AddressRequest) {
    // La primera direccion no se marca predeterminada sola
    const saved = await api.create({ ...body, isDefault: body.isDefault || !items.value.length })
    apply(saved)
    return saved
  }

  async function update(id: string, body: AddressRequest) {
    const saved = await api.update(id, body)
    apply(saved)
    return saved
  }

  async function setDefault(id: string) {
    apply(await api.setDefault(id))
  }

  /** Borrar la predeterminada no asigna otra: el backend tampoco lo hace. */
  async function remove(id: string) {
    await api.remove(id)
    items.value = items.value.filter(a => a.id !== id)
  }

  function $reset() {
    items.value = []
    loaded.value = false
    error.value = null
  }

  return { items, sorted, defaultAddress, isFull, loaded, pending, error, load, create, update, setDefault, remove, $reset }
})
