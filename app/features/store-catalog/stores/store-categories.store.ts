import { defineStore } from 'pinia'
import { useCategoriesApi } from '../services'
import type { StoreCategory } from '../types'
import { resolveCategoryPath } from '../utils/category-tree'

/**
 * Arbol publico de categorias. Lo comparten la navegacion y los listados, asi que
 * se pide una sola vez por visita (el SSR lo hidrata en el cliente).
 */
export const useStoreCategoriesStore = defineStore('store-categories', () => {
  const api = useCategoriesApi()
  const tree = ref<StoreCategory[]>([])
  const loaded = ref(false)
  const error = ref<string | null>(null)
  let request: Promise<void> | null = null

  async function load() {
    error.value = null
    try {
      tree.value = await api.tree()
      loaded.value = true
    }
    catch (e) {
      error.value = parseApiError(e).message
    }
    finally {
      request = null
    }
  }

  function ensureLoaded() {
    if (loaded.value) return Promise.resolve()
    request ??= load()
    return request
  }

  const resolve = (slugs: string[]) => resolveCategoryPath(tree.value, slugs)

  return { tree, loaded, error, ensureLoaded, resolve }
})
