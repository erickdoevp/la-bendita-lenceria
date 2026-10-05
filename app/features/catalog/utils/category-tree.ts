import type { CategoryNode, CategoryOption } from '../types'

/** Aplana el arbol en orden de lectura para usarlo en un <select>. */
export function flattenCategoryTree(nodes: CategoryNode[], depth = 0, parentPath = ''): CategoryOption[] {
  return nodes.flatMap((node) => {
    const path = parentPath ? `${parentPath} / ${node.name}` : node.name
    return [
      { id: node.id, name: node.name, depth, path },
      ...flattenCategoryTree(node.children ?? [], depth + 1, path),
    ]
  })
}
