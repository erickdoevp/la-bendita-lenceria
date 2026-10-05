import { MAX_CATEGORY_DEPTH, STORE_ROUTES } from '../constants'
import type { ResolvedCategory, StoreCategory } from '../types'

/** Busca la categoria que corresponde a los segmentos de la URL, nivel por nivel. */
export function resolveCategoryPath(tree: StoreCategory[], slugs: string[]): ResolvedCategory | null {
  if (!slugs.length || slugs.length > MAX_CATEGORY_DEPTH) return null

  const trail: StoreCategory[] = []
  let level = tree
  for (const slug of slugs) {
    const match = level.find(node => node.slug === slug)
    if (!match) return null
    trail.push(match)
    level = match.children
  }

  return {
    category: trail.at(-1)!,
    trail,
    path: STORE_ROUTES.category(...slugs),
  }
}

/** Ids de la categoria y todas sus descendientes: un listado incluye los productos de sus hijas. */
export function collectCategoryIds(category: StoreCategory): string[] {
  return [category.id, ...category.children.flatMap(collectCategoryIds)]
}

/** Recorta el arbol a la profundidad permitida por si el backend manda niveles de mas. */
export function limitCategoryDepth(nodes: StoreCategory[], depth = 1): StoreCategory[] {
  return nodes.map(node => ({
    ...node,
    children: depth >= MAX_CATEGORY_DEPTH ? [] : limitCategoryDepth(node.children, depth + 1),
  }))
}

/** Camino [raiz, ..., categoria] hasta el id dado, o null si no esta en el arbol. */
export function findCategoryTrail(tree: StoreCategory[], id: string): StoreCategory[] | null {
  for (const node of tree) {
    if (node.id === id) return [node]
    const below = findCategoryTrail(node.children, id)
    if (below) return [node, ...below]
  }
  return null
}

/** Ruta publica de un camino de categorias. */
export const categoryTrailPath = (trail: StoreCategory[]) => STORE_ROUTES.category(...trail.map(n => n.slug))
