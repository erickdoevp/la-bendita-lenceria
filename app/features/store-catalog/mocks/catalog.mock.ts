// Catalogo de ejemplo compartido por el inicio, el listado y el detalle. Se genera de
// forma determinista a partir del arbol de categorias para que cada hoja tenga productos.
import type { StoreCategory, StoreColor, StoreProduct } from '../types'
import { CATEGORY_TREE_MOCK } from './categories.mock'
import { unsplash } from './unsplash'

/** Producto con los campos que el backend usara para filtrar y ordenar. */
export interface MockCatalogProduct extends StoreProduct {
  categoryId: string
  sizes: string[]
  createdAt: number
  sales: number
  featured: number
}

export const MOCK_COLORS: Record<string, StoreColor> = {
  negro: { name: 'Negro', hex: '#1f1f23' },
  carmin: { name: 'Carmín', hex: '#a3203f' },
  rosa: { name: 'Rosa palo', hex: '#e7b9c2' },
  marfil: { name: 'Marfil', hex: '#efe9df' },
  nude: { name: 'Nude', hex: '#d2a98c' },
  marino: { name: 'Azul marino', hex: '#26324f' },
  cielo: { name: 'Azul cielo', hex: '#8fb4d9' },
  olivo: { name: 'Olivo', hex: '#6b6b3a' },
  coral: { name: 'Coral', hex: '#e8735f' },
}

export const MOCK_IMAGE_POOLS = {
  lenceria: [
    '1694290340663-65804773ce7a', '1572358764342-612d02e2d2d2', '1561375958-669d8413fa06',
    '1642945667252-c0a68e4c2904', '1642945680515-faada4c0ca7b', '1544838447-e08c8c6006ce',
    '1574539602047-548bf9557352', '1528154201826-284bc74f89f0', '1631242362679-d1d4d2d52af1',
    '1541182311535-f31f1aa15d12', '1657753023885-7e30e39bf039', '1625023489823-c9c1e36d6f2b',
    '1651671488026-7a14be2e03c2', '1568441556126-f36ae0900180',
  ],
  'trajes-de-bano': [
    '1515161318750-781d6122e367', '1593836788196-9fd68e904906', '1630588034516-9180c7ead89e',
    '1602237778252-f3baa6486c59', '1585924756944-b82af627eca9', '1467632499275-7a693a761056',
    '1571425046076-94af69bd4201', '1616147503419-500e80be8447', '1591901559829-ce65d7eaca0a',
    '1691315720837-ba3509f28ed1', '1606792109963-7b34205b1333', '1622476591347-fc28c1a9d64a',
    '1697739348487-75f668fdb6fb',
  ],
  pijamas: [
    '1766056278944-ca0e4f49e61f', '1770294758981-484ef12c1815', '1766056278948-dbb10f6d82bf',
    '1770294758967-6ed2b93ce42c', '1768696082668-411638a55476', '1770294760762-1cd821ecc567',
  ],
} as const

const STYLE_NAMES = [
  'Alba', 'Lirio', 'Noa', 'Brisa', 'Luna', 'Dalia', 'Vera', 'Iris', 'Coral', 'Selva',
  'Aurora', 'Perla', 'Malva', 'Duna', 'Cielo', 'Nácar', 'Rocío', 'Jade', 'Sol', 'Bruma',
]

/** Nombre del tipo de prenda segun la hoja; cae al nombre de la categoria. */
const NOUNS: Record<string, string> = {
  'push-up': 'Brasier push up',
  'con-varilla': 'Brasier con varilla',
  'sin-varilla': 'Brasier sin varilla',
  'strapless': 'Brasier strapless',
  'encaje': 'Bralette de encaje',
  'basicos': 'Bralette básico',
  'bikini': 'Panty bikini',
  'tanga': 'Tanga',
  'cachetero': 'Cachetero',
  'conjuntos': 'Conjunto',
  'bodies': 'Body',
  'triangulares': 'Bikini triangular',
  'bandeau': 'Bikini bandeau',
  'talle-alto': 'Bikini de talle alto',
  'escotados': 'Completo escotado',
  'moldeadores': 'Completo moldeador',
  'salidas-de-playa': 'Salida de playa',
  'satin/manga-larga': 'Pijama de satín',
  'satin/con-short': 'Short de satín',
  'algodon/manga-larga': 'Pijama de algodón',
  'algodon/con-short': 'Short de algodón',
  'batas': 'Bata',
  'camisones': 'Camisón',
}

const BRA_SIZES = ['32A', '32B', '32C', '34A', '34B', '34C', '34D', '36B', '36C', '36D', '38C', '38D']
const LETTER_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

/** Generador pseudoaleatorio con semilla: mismos datos en servidor y cliente. */
function createRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

function leaves(node: StoreCategory, trail: StoreCategory[] = []): { leaf: StoreCategory, trail: StoreCategory[] }[] {
  const path = [...trail, node]
  return node.children.length
    ? node.children.flatMap(child => leaves(child, path))
    : [{ leaf: node, trail: path }]
}

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.UTC(2026, 9, 1)

function buildMockProducts(tree: StoreCategory[]): MockCatalogProduct[] {
  const random = createRandom(20261005)
  const pick = <T>(list: readonly T[]) => list[Math.floor(random() * list.length)]!
  const products: MockCatalogProduct[] = []

  for (const root of tree) {
    const pool = MOCK_IMAGE_POOLS[root.slug as keyof typeof MOCK_IMAGE_POOLS] ?? MOCK_IMAGE_POOLS.lenceria
    for (const { leaf, trail } of leaves(root)) {
      const parent = trail.at(-2)
      const isBra = parent?.slug === 'brasieres'
      const noun = NOUNS[`${parent?.slug}/${leaf.slug}`] ?? NOUNS[leaf.slug] ?? leaf.name
      const count = 3 + Math.floor(random() * 3)

      for (let i = 0; i < count; i++) {
        const index = products.length
        const style = STYLE_NAMES[(index * 7) % STYLE_NAMES.length]!
        const basePrice = root.slug === 'pijamas' ? 790 : root.slug === 'trajes-de-bano' ? 690 : 390
        const price = Math.round((basePrice + random() * 900) / 10) * 10 - 1
        const onSale = random() < 0.22
        const colorKeys = Object.keys(MOCK_COLORS)
        const colorCount = 1 + Math.floor(random() * 4)
        const colors = [...new Set(Array.from({ length: colorCount }, () => pick(colorKeys)))]
        const sizeSource = isBra ? BRA_SIZES : LETTER_SIZES
        const sizes = sizeSource.filter(() => random() < 0.7)
        // Rotacion secuencial: productos vecinos nunca comparten foto
        const image = pool[index % pool.length]!
        const hover = pool[(index + Math.ceil(pool.length / 2)) % pool.length]!
        const ageDays = Math.floor(random() * 120)

        products.push({
          id: `p-${leaf.id}-${i}`,
          name: `${noun} ${style}`,
          slug: `${noun} ${style}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-'),
          price,
          compareAtPrice: onSale ? Math.round(price * 1.25 / 10) * 10 - 1 : null,
          categoryName: leaf.name,
          imageUrl: unsplash(image, 700),
          hoverImageUrl: random() < 0.5 ? unsplash(hover, 700) : null,
          colors: colors.map(key => MOCK_COLORS[key]!),
          isNew: ageDays < 21,
          categoryId: leaf.id,
          sizes: sizes.length ? sizes : [sizeSource[2]!],
          createdAt: NOW - ageDays * DAY,
          sales: Math.floor(random() * 400),
          featured: random(),
        })
      }
    }
  }

  return products
}

let catalog: MockCatalogProduct[] | null = null

/** Catalogo completo (se arma una vez por proceso). */
export function getMockCatalog(): MockCatalogProduct[] {
  catalog ??= buildMockProducts(CATEGORY_TREE_MOCK)
  return catalog
}

/** Slug de color para URLs y filtros: llave de MOCK_COLORS a partir del hex. */
export const mockColorKey = (hex: string) =>
  Object.entries(MOCK_COLORS).find(([, color]) => color.hex === hex)?.[0] ?? hex
