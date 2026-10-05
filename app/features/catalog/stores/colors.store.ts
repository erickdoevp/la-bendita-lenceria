import { defineStore } from 'pinia'
import type { ColorRequest } from '../schemas'
import { useCatalogApi } from '../services'
import type { Color } from '../types'
import { createResource } from '../utils/resource'

export const useColorsStore = defineStore('catalog-colors', () => {
  const api = useCatalogApi()
  const all = createResource(() => api.listColors(), [] as Color[])
  const list = reactive(createPagedList(query => api.listColorsPage(query), { name: '' }))

  const items = computed(() => [...all.data.value].sort((a, b) => a.name.localeCompare(b.name, 'es')))
  const byId = computed(() => new Map(all.data.value.map(c => [c.id, c])))

  async function create(body: ColorRequest) {
    const color = await api.createColor(body)
    all.data.value = [...all.data.value, color]
    void list.load()
    return color
  }

  async function update(id: string, body: ColorRequest) {
    const color = await api.updateColor(id, body)
    all.data.value = all.data.value.map(c => (c.id === id ? color : c))
    void list.load()
    return color
  }

  async function remove(id: string) {
    await api.deleteColor(id)
    all.data.value = all.data.value.filter(c => c.id !== id)
    void list.load()
  }

  return {
    items,
    byId,
    status: all.status,
    error: all.error,
    list,
    fetchAll: all.load,
    create,
    update,
    remove,
  }
})
