import { USE_CATEGORY_MOCKS } from '../constants'
import { CATEGORY_TREE_MOCK } from '../mocks/categories.mock'
import type { StoreCategory } from '../types'
import { limitCategoryDepth } from '../utils/category-tree'

type FetchOptions = NonNullable<Parameters<typeof $fetch>[1]>
export type PublicFetch = <T>(path: string, options?: FetchOptions) => Promise<T>

export function createCategoriesApi(publicFetch: PublicFetch) {
  return {
    /**
     * Arbol completo de categorias activas. Las raices (Lenceria, Trajes de bano,
     * Pijamas) vienen del backend, asi que agregar o quitar una no toca el front.
     * TODO: mapear CategoryNode -> StoreCategory (summary sale del rich text de description).
     */
    tree: async (): Promise<StoreCategory[]> => {
      const tree = USE_CATEGORY_MOCKS
        ? structuredClone(CATEGORY_TREE_MOCK)
        : await publicFetch<StoreCategory[]>('/categories/tree')
      return limitCategoryDepth(tree)
    },
  }
}
