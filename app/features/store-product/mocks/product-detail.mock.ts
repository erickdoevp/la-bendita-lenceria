// Detalle de ejemplo armado a partir del catalogo compartido. Determinista por slug:
// el mismo producto genera las mismas variantes y resenas en servidor y cliente.
import type { MockCatalogProduct } from '~/features/store-catalog'
import {
  CATEGORY_TREE_MOCK,
  findCategoryTrail,
  getMockCatalog,
  MOCK_IMAGE_POOLS,
  mockColorKey,
  unsplash,
} from '~/features/store-catalog'
import type { ProductGalleryImage, ProductReview, ProductVariantOption, ReviewFit, StoreProductDetail } from '../types'

function hash(text: string) {
  let h = 2166136261
  for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 16777619)
  return h >>> 0
}

function createRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const COPY: Record<string, { description: string[], highlights: string[], materials: string, care: string[] }> = {
  'lenceria': {
    description: [
      'Encaje suave al tacto con costuras planas que no marcan bajo la ropa. Pensado para usarse todo el día sin incomodar.',
      'El patrón se ajusta al cuerpo sin apretar y los tirantes se regulan para encontrar tu punto exacto.',
    ],
    highlights: ['Tirantes ajustables', 'Costuras planas que no marcan', 'Broche trasero de tres posiciones'],
    materials: '82 % poliamida, 18 % elastano. Forro de algodón.',
    care: ['Lavar a mano con agua fría', 'No usar secadora', 'Secar a la sombra, en plano'],
  },
  'trajes-de-bano': {
    description: [
      'Tela de secado rápido con protección contra el cloro y la sal, para que el color dure varias temporadas.',
      'El corte acompaña el movimiento: puedes nadar, caminar en la playa o tirarte al sol sin estar acomodándolo.',
    ],
    highlights: ['Secado rápido', 'Forro completo', 'Resistente al cloro'],
    materials: '78 % poliamida reciclada, 22 % elastano.',
    care: ['Enjuagar con agua dulce después de usar', 'Lavar a mano', 'No exprimir ni retorcer'],
  },
  'pijamas': {
    description: [
      'Tela ligera que cae suelta y no se pega al cuerpo, para dormir fresca en cualquier temporada.',
      'Botones forrados y pretina elástica cubierta que no aprieta la cintura.',
    ],
    highlights: ['Pretina elástica cubierta', 'Corte holgado', 'Bolsillo en el pecho'],
    materials: '100 % poliéster con acabado satinado.',
    care: ['Lavar en ciclo delicado', 'Planchar a temperatura baja por el revés', 'No usar blanqueador'],
  },
}

const AUTHORS = ['Mariana G.', 'Daniela R.', 'Fernanda L.', 'Ximena T.', 'Andrea M.', 'Paola S.', 'Regina V.', 'Lucía H.', 'Valeria C.', 'Itzel P.', 'Renata O.', 'Sofía B.']

const REVIEW_SNIPPETS: { rating: number, title: string, body: string }[] = [
  { rating: 5, title: 'Muy cómodo', body: 'Lo uso todo el día y no se siente. La tela es suave y no marca nada.' },
  { rating: 5, title: 'Se ve mejor en persona', body: 'El color es justo como en la foto y el encaje se ve de buena calidad.' },
  { rating: 4, title: 'Bonito, pero revisa la talla', body: 'Me gustó mucho, aunque siento que talla un poco justo. La próxima pido una más.' },
  { rating: 5, title: 'Ya es mi favorito', body: 'Compré uno y regresé por otro color. Llegó rápido y muy bien empacado.' },
  { rating: 4, title: 'Buena compra', body: 'Cumple lo que promete. Los tirantes se ajustan bien y no se resbalan.' },
  { rating: 3, title: 'Bien, sin más', body: 'Está bonito, pero esperaba una tela un poco más gruesa por el precio.' },
  { rating: 5, title: 'Me quedó perfecto', body: 'Seguí la guía de tallas y acerté a la primera. Muy recomendable.' },
  { rating: 4, title: 'Lindo y cómodo', body: 'Lo lavé a mano varias veces y sigue como nuevo.' },
]

const FITS: ReviewFit[] = ['true', 'true', 'true', 'small', 'large']

export interface MockProductBundle {
  detail: StoreProductDetail
  reviews: ProductReview[]
}

const cache = new Map<string, MockProductBundle | null>()

function build(product: MockCatalogProduct): MockProductBundle {
  const random = createRandom(hash(product.slug))
  const trail = findCategoryTrail(CATEGORY_TREE_MOCK, product.categoryId) ?? []
  const root = trail[0]?.slug ?? 'lenceria'
  const copy = COPY[root] ?? COPY.lenceria!
  const isBra = trail[1]?.slug === 'brasieres'

  const colors = product.colors.map(color => ({ key: mockColorKey(color.hex), name: color.name, hex: color.hex }))

  // Fotos: las dos del catalogo y dos mas del mismo tipo de prenda, repartidas entre los colores
  const pool = MOCK_IMAGE_POOLS[root as keyof typeof MOCK_IMAGE_POOLS] ?? MOCK_IMAGE_POOLS.lenceria
  const offset = Math.floor(random() * pool.length)
  const extra = [pool[offset % pool.length]!, pool[(offset + 4) % pool.length]!].map(id => unsplash(id, 1200))
  const urls = [...new Set([product.imageUrl, product.hoverImageUrl, ...extra].filter(Boolean) as string[])]
    .map(url => url.replace(/w=\d+/, 'w=1200'))
  const images: ProductGalleryImage[] = urls.map((url, index) => {
    const color = colors.length > 1 ? colors[index % colors.length]! : null
    return {
      id: `${product.id}-img-${index}`,
      url,
      alt: color ? `${product.name} en color ${color.name.toLowerCase()}` : product.name,
      colorKey: color?.key ?? null,
    }
  })

  const variants: ProductVariantOption[] = colors.flatMap(color => product.sizes.map((size) => {
    const roll = random()
    return {
      id: `${product.id}-${color.key}-${size}`,
      sku: `${product.slug.slice(0, 10).toUpperCase()}-${color.key.slice(0, 3).toUpperCase()}-${size}`,
      colorKey: color.key,
      size,
      // ~20 % agotado, ~15 % con pocas piezas
      stock: roll < 0.2 ? 0 : roll < 0.35 ? 1 + Math.floor(random() * 3) : 4 + Math.floor(random() * 12),
      price: product.price,
    }
  }))

  const reviewCount = Math.floor(random() * 14)
  const reviews: ProductReview[] = Array.from({ length: reviewCount }, (_, index) => {
    const snippet = REVIEW_SNIPPETS[Math.floor(random() * REVIEW_SNIPPETS.length)]!
    const daysAgo = 3 + Math.floor(random() * 200)
    const date = new Date(Date.UTC(2026, 9, 1) - daysAgo * 86400000)
    return {
      id: `${product.id}-review-${index}`,
      author: AUTHORS[Math.floor(random() * AUTHORS.length)]!,
      rating: snippet.rating,
      title: snippet.title,
      body: snippet.body,
      createdAt: date.toISOString().slice(0, 10),
      verifiedPurchase: random() < 0.75,
      sizePurchased: product.sizes[Math.floor(random() * product.sizes.length)] ?? null,
      fit: FITS[Math.floor(random() * FITS.length)]!,
    }
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  return {
    detail: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      isNew: product.isNew,
      categoryId: product.categoryId,
      description: copy.description,
      highlights: isBra ? ['Copa con relleno removible', ...copy.highlights.slice(0, 2)] : copy.highlights,
      materials: copy.materials,
      care: copy.care,
      colors,
      sizes: product.sizes,
      sizeSystem: isBra ? 'brasier' : 'letra',
      images,
      variants,
      rating: reviews.length ? { average, count: reviews.length } : null,
    },
    reviews,
  }
}

export function findMockProduct(slug: string): MockProductBundle | null {
  if (!cache.has(slug)) {
    const product = getMockCatalog().find(p => p.slug === slug)
    cache.set(slug, product ? build(product) : null)
  }
  return cache.get(slug) ?? null
}

/** Misma subcategoria primero; si no alcanza, el resto de la categoria padre. */
export function findMockRelated(productId: string, limit: number) {
  const catalog = getMockCatalog()
  const current = catalog.find(p => p.id === productId)
  if (!current) return []
  const trail = findCategoryTrail(CATEGORY_TREE_MOCK, current.categoryId) ?? []
  const parent = trail.at(-2)
  const siblingIds = new Set(parent ? parent.children.map(child => child.id) : [])
  const others = catalog.filter(p => p.id !== productId)
  const sameLeaf = others.filter(p => p.categoryId === current.categoryId)
  const sameParent = others.filter(p => p.categoryId !== current.categoryId && siblingIds.has(p.categoryId))
  return [...sameLeaf, ...sameParent]
    .slice(0, limit)
    .map(({ categoryId: _c, sizes: _s, createdAt: _d, sales: _v, featured: _f, ...product }) => product)
}
