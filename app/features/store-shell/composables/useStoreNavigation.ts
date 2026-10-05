import type { StoreCategory } from '~/features/store-catalog'
import { STORE_ROUTES, useStoreCategories } from '~/features/store-catalog'
import { STORE_NAV_LEADING, STORE_NAV_TRAILING } from '../constants'

export interface NavCategory {
  id: string
  name: string
  to: string
  children: NavCategory[]
}

function toNav(node: StoreCategory, parents: string[] = []): NavCategory {
  const slugs = [...parents, node.slug]
  return {
    id: node.id,
    name: node.name,
    to: STORE_ROUTES.category(...slugs),
    children: node.children.map(child => toNav(child, slugs)),
  }
}

/** Menu de la tienda: enlaces fijos + arbol de categorias del backend. */
export async function useStoreNavigation() {
  const categories = await useStoreCategories()
  const roots = computed(() => categories.tree.map(node => toNav(node)))
  return { roots, leading: STORE_NAV_LEADING, trailing: STORE_NAV_TRAILING }
}
