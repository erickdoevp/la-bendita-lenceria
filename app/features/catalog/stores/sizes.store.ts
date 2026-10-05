import { defineStore } from 'pinia'
import type { SizeRequest } from '../schemas'
import { useCatalogApi } from '../services'
import type { Size } from '../types'
import { createResource } from '../utils/resource'

const bySortOrder = (a: Size, b: Size) => a.sortOrder - b.sortOrder

export const useSizesStore = defineStore('catalog-sizes', () => {
  const api = useCatalogApi()
  const all = createResource(() => api.listSizes(), [] as Size[])
  const list = reactive(createPagedList(query => api.listSizesPage(query), { name: '' }))

  const items = computed(() => [...all.data.value].sort(bySortOrder))
  const nextSortOrder = computed(() => Math.max(0, ...all.data.value.map(s => s.sortOrder)) + 1)

  async function create(body: SizeRequest) {
    const size = await api.createSize(body)
    all.data.value = [...all.data.value, size]
    void list.load()
    return size
  }

  async function update(id: string, body: SizeRequest) {
    const size = await api.updateSize(id, body)
    all.data.value = all.data.value.map(s => (s.id === id ? size : s))
    void list.load()
    return size
  }

  async function remove(id: string) {
    await api.deleteSize(id)
    all.data.value = all.data.value.filter(s => s.id !== id)
    void list.load()
  }

  return {
    items,
    status: all.status,
    error: all.error,
    nextSortOrder,
    list,
    fetchAll: all.load,
    create,
    update,
    remove,
  }
})
