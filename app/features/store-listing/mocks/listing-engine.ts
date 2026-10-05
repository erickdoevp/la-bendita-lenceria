// Replica en memoria lo que hara el endpoint de listado: filtrar, contar facetas,
// ordenar y paginar. Sirve tambien como especificacion para el backend.
import { PRICE_RANGES, SIZE_ORDER } from '../constants'
import type { ColorFacetOption, FacetOption, ListingQuery, ListingResult, ListingSort } from '../types'
import { MOCK_COLORS, type MockCatalogProduct } from '~/features/store-catalog'

type Facet = 'sizes' | 'colors' | 'price' | 'onSale'

/** Slug de color para la URL: "Azul marino" -> "azul-marino". Coincide con las llaves de MOCK_COLORS. */
const colorKeyByHex = new Map(Object.entries(MOCK_COLORS).map(([key, color]) => [color.hex, key]))

function matches(product: MockCatalogProduct, query: ListingQuery, ignore?: Facet) {
  if (ignore !== 'sizes' && query.sizes.length && !product.sizes.some(size => query.sizes.includes(size))) return false
  if (ignore !== 'colors' && query.colors.length
    && !product.colors.some(color => query.colors.includes(colorKeyByHex.get(color.hex) ?? ''))) return false
  if (ignore !== 'price' && query.price) {
    const range = PRICE_RANGES.find(r => r.value === query.price)
    if (range && (product.price < range.min || product.price >= range.max)) return false
  }
  if (ignore !== 'onSale' && query.onSale && !product.compareAtPrice) return false
  return true
}

const sorters: Record<ListingSort, (a: MockCatalogProduct, b: MockCatalogProduct) => number> = {
  'relevance': (a, b) => b.featured - a.featured,
  'newest': (a, b) => b.createdAt - a.createdAt,
  'best-selling': (a, b) => b.sales - a.sales,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
}

const sizeRank = (size: string) => {
  const index = SIZE_ORDER.indexOf(size)
  return index < 0 ? SIZE_ORDER.length : index
}

export function runListingQuery(all: MockCatalogProduct[], categoryIds: string[], query: ListingQuery): ListingResult {
  const ids = new Set(categoryIds)
  const inCategory = all.filter(product => ids.has(product.categoryId))

  // Cada faceta cuenta con los demas filtros aplicados, pero no con el suyo:
  // asi se ve cuantos productos habria al cambiar de opcion
  const sizeCounts = new Map<string, number>()
  for (const product of inCategory.filter(p => matches(p, query, 'sizes'))) {
    for (const size of product.sizes) sizeCounts.set(size, (sizeCounts.get(size) ?? 0) + 1)
  }

  const colorCounts = new Map<string, number>()
  for (const product of inCategory.filter(p => matches(p, query, 'colors'))) {
    for (const color of product.colors) {
      const key = colorKeyByHex.get(color.hex)
      if (key) colorCounts.set(key, (colorCounts.get(key) ?? 0) + 1)
    }
  }

  // Las opciones activas siempre aparecen (aunque queden en 0) para poder quitarlas desde el panel
  for (const size of query.sizes) if (!sizeCounts.has(size)) sizeCounts.set(size, 0)
  for (const color of query.colors) if (MOCK_COLORS[color] && !colorCounts.has(color)) colorCounts.set(color, 0)

  const forPrice = inCategory.filter(p => matches(p, query, 'price'))
  const prices: FacetOption[] = PRICE_RANGES.map(range => ({
    value: range.value,
    label: range.label,
    count: forPrice.filter(p => p.price >= range.min && p.price < range.max).length,
  }))

  const sizes: FacetOption[] = [...sizeCounts]
    .sort(([a], [b]) => sizeRank(a) - sizeRank(b))
    .map(([value, count]) => ({ value, label: value, count }))

  const colors: ColorFacetOption[] = [...colorCounts]
    .map(([value, count]) => ({ value, label: MOCK_COLORS[value]!.name, hex: MOCK_COLORS[value]!.hex, count }))
    .sort((a, b) => b.count - a.count)

  const onSaleCount = inCategory.filter(p => matches(p, query, 'onSale') && p.compareAtPrice).length

  const filtered = inCategory.filter(p => matches(p, query)).sort(sorters[query.sort])
  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / query.pageSize))
  const page = Math.min(Math.max(1, query.page), totalPages)
  const start = (page - 1) * query.pageSize

  return {
    products: filtered.slice(start, start + query.pageSize).map(
      ({ categoryId: _c, sizes: _s, createdAt: _d, sales: _v, featured: _f, ...product }) => product,
    ),
    page,
    pageSize: query.pageSize,
    totalItems,
    totalPages,
    facets: { sizes, colors, prices, onSaleCount },
  }
}
