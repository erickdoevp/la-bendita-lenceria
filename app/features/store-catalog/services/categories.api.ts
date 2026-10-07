import { USE_CATEGORY_MOCKS } from '../constants'
import { CATEGORY_TREE_MOCK } from '../mocks/categories.mock'
import type { CategoryTreeDto, StoreCategory } from '../types'
import { limitCategoryDepth } from '../utils/category-tree'

type FetchOptions = NonNullable<Parameters<typeof $fetch>[1]>
export type PublicFetch = <T>(path: string, options?: FetchOptions) => Promise<T>

/**
 * CategoryTreeDto -> StoreCategory. El backend ya omite las ramas cuyo padre esta
 * inactivo; aun asi se descartan nodos con active=false por si llegara alguno.
 */
function toStoreCategories(nodes: CategoryTreeDto[] | null | undefined): StoreCategory[] {
  return (nodes ?? [])
    .filter(node => node.active !== false)
    .map(node => ({
      id: node.id,
      name: node.name,
      slug: node.slug,
      summary: richTextToPlain(node.description) || null,
      imageUrl: node.imageUrl ?? null,
      children: toStoreCategories(node.children),
    }))
}

export function createCategoriesApi(publicFetch: PublicFetch) {
  return {
    /**
     * Arbol completo de categorias activas. Las raices (Lenceria, Trajes de bano,
     * Pijamas) vienen del backend, asi que agregar o quitar una no toca el front.
     */
    tree: async (): Promise<StoreCategory[]> => {
      const tree = USE_CATEGORY_MOCKS
        ? structuredClone(CATEGORY_TREE_MOCK)
        : toStoreCategories(await publicFetch<CategoryTreeDto[]>('/categories/tree'))
      return limitCategoryDepth(tree)
    },
  }
}
