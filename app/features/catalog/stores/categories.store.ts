import { defineStore } from 'pinia'
import type { CategoryRequest } from '../schemas'
import { useCatalogApi } from '../services'
import type { CategoryNode } from '../types'
import { flattenCategoryTree } from '../utils/category-tree'
import { createResource } from '../utils/resource'

export type ActiveFilter = '' | 'true' | 'false'

export const useCategoriesStore = defineStore('catalog-categories', () => {
  const api = useCatalogApi()
  const tree = createResource(() => api.categoryTree(), [] as CategoryNode[])
  const list = reactive(createPagedList(
    ({ active, ...query }) => api.listCategories({ ...query, active: active === '' ? undefined : active === 'true' }),
    { name: '', active: '' as ActiveFilter },
  ))

  /** Opciones para el select de categoria: solo activas, en orden de arbol. */
  const options = computed(() => flattenCategoryTree(tree.data.value))

  async function create(data: CategoryRequest, image: File | null) {
    const category = await api.createCategory(data, image)
    // El arbol solo trae activas y depende del padre: se vuelve a pedir
    await tree.load(true)
    void list.load()
    return category
  }

  return {
    tree: tree.data,
    options,
    status: tree.status,
    error: tree.error,
    list,
    fetchTree: tree.load,
    create,
  }
})
