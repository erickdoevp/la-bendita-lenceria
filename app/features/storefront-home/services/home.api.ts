import type { ProductSummaryDto } from '~/features/store-catalog'
import { getMockCatalog, toStoreProduct } from '~/features/store-catalog'
import { HOME_LATEST_LIMIT, USE_HOME_CATEGORY_MOCKS, USE_HOME_LATEST_MOCKS, USE_HOME_MOCKS } from '../constants'
import { HOME_CATEGORIES_MOCK, HOME_COLLECTIONS_MOCK, HOME_HERO_MOCK } from '../mocks/home.mock'
import type { NewsletterRequest } from '../schemas'
import type { CategoryResponseDto, HomeCategory, HomeCollection, HomeHeroContent, StoreProduct } from '../types'

type FetchOptions = NonNullable<Parameters<typeof $fetch>[1]>
export type PublicFetch = <T>(path: string, options?: FetchOptions) => Promise<T>

/** Simula la latencia de red para poder ver los estados de carga. */
const fromMock = <T>(data: T) => new Promise<T>(resolve => setTimeout(() => resolve(structuredClone(data)), 250))

/** Lo mas nuevo del catalogo de ejemplo, para que las tarjetas lleven a productos que existen. */
function latestFromCatalog(size: number): StoreProduct[] {
  return [...getMockCatalog()]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, size)
    .map(({ categoryId: _c, sizes: _s, createdAt: _d, sales: _v, featured: _f, ...product }) => product)
}

/** CategoryResponseDto -> HomeCategory. Las raices traen parent null; si llega una hija, su ruta incluye al padre. */
function toHomeCategory(dto: CategoryResponseDto): HomeCategory {
  return {
    id: dto.id,
    name: dto.name,
    slugs: dto.parent ? [dto.parent.slug, dto.slug] : [dto.slug],
    imageUrl: dto.imageUrl ?? null,
    summary: richTextToPlain(dto.description) || null,
  }
}

/**
 * Endpoints publicos del inicio (sin sesion).
 * TODO: al integrar el backend, mapear los DTOs (Collection) a los modelos de types.ts dentro de cada metodo.
 */
export function createHomeApi(publicFetch: PublicFetch) {
  return {
    // TODO: banners administrables. Por ahora el hero es contenido fijo.
    hero: (): Promise<HomeHeroContent> => fromMock(HOME_HERO_MOCK),

    // Solo la primera pagina: el resto vive en /novedades
    latestProducts: async (size = HOME_LATEST_LIMIT): Promise<StoreProduct[]> => {
      if (USE_HOME_LATEST_MOCKS) return fromMock(latestFromCatalog(size))
      const raw = await publicFetch<RawPage<ProductSummaryDto>>('/products', {
        query: { sort: 'publishedAt,desc', page: 0, size },
      })
      return toPage(raw).items.map(toStoreProduct)
    },

    featuredCategories: async (): Promise<HomeCategory[]> => {
      if (USE_HOME_CATEGORY_MOCKS) return fromMock(HOME_CATEGORIES_MOCK)
      const roots = await publicFetch<CategoryResponseDto[]>('/categories/roots')
      return roots.filter(dto => dto.active !== false).map(toHomeCategory)
    },

    collections: (): Promise<HomeCollection[]> =>
      USE_HOME_MOCKS
        ? fromMock(HOME_COLLECTIONS_MOCK)
        : publicFetch<HomeCollection[]>('/collections'),

    // TODO: endpoint de suscripcion (o proveedor de email marketing)
    subscribe: (body: NewsletterRequest): Promise<null> =>
      USE_HOME_MOCKS
        ? fromMock(null)
        : publicFetch<null>('/newsletter/subscriptions', { method: 'POST', body }),
  }
}
