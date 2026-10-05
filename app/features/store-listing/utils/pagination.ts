export type PageItem = { type: 'page', page: number } | { type: 'gap', key: string }

/**
 * Paginas visibles con huecos: 1 ... 4 5 [6] 7 8 ... 20.
 * Siempre muestra la primera, la ultima y `siblings` a cada lado de la actual.
 */
export function buildPageItems(current: number, total: number, siblings = 1): PageItem[] {
  const pages = new Set([1, total])
  for (let p = current - siblings; p <= current + siblings; p++) {
    if (p >= 1 && p <= total) pages.add(p)
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const items: PageItem[] = []
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1]
    if (previous !== undefined && page - previous === 2) items.push({ type: 'page', page: page - 1 })
    else if (previous !== undefined && page - previous > 2) items.push({ type: 'gap', key: `gap-${page}` })
    items.push({ type: 'page', page })
  })
  return items
}
