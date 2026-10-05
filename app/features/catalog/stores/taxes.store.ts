import { defineStore } from 'pinia'
import type { TaxRequest } from '../schemas'
import { useCatalogApi } from '../services'
import type { TaxConfig } from '../types'
import { createResource } from '../utils/resource'

export const useTaxesStore = defineStore('catalog-taxes', () => {
  const api = useCatalogApi()
  const all = createResource(() => api.listTaxes(), [] as TaxConfig[])

  const items = computed(() => [...all.data.value].sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name, 'es')))
  const activeTax = computed(() => all.data.value.find(t => t.active) ?? null)

  /** Solo puede haber un IVA activo: al activar uno, el resto queda inactivo. */
  function markActive(id: string) {
    all.data.value = all.data.value.map(t => ({ ...t, active: t.id === id }))
  }

  async function create(body: TaxRequest) {
    const tax = await api.createTax(body)
    all.data.value = [...all.data.value, tax]
    if (tax.active) markActive(tax.id)
    return tax
  }

  async function activate(id: string) {
    await api.activateTax(id)
    markActive(id)
  }

  return {
    items,
    activeTax,
    status: all.status,
    error: all.error,
    fetchAll: all.load,
    create,
    activate,
  }
})
