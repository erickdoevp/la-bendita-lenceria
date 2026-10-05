import type { useAuthFetch } from '~/features/auth'
import type { CategoryRequest, ColorRequest, SizeRequest, TaxRequest } from '../schemas'
import type { Category, CategoryNode, Color, Size, TaxConfig } from '../types'

type AuthFetch = ReturnType<typeof useAuthFetch>

export interface AdminListQuery {
  name?: string
  page?: number
  size?: number
}

export interface CategoryListQuery extends AdminListQuery {
  active?: boolean
  parentId?: string
}

/** Quita filtros vacios para no mandar "name=" al backend. */
function cleanQuery(query: object) {
  return Object.fromEntries(Object.entries(query).filter(([, v]) => v !== '' && v != null))
}

export function createCatalogApi(authFetch: AuthFetch) {
  return {
    // Impuestos
    listTaxes: () => authFetch<TaxConfig[]>('/tax'),
    createTax: (body: TaxRequest) => authFetch<TaxConfig>('/tax', { method: 'POST', body }),
    activateTax: (id: string) => authFetch<TaxConfig>(`/tax/${id}/activate`, { method: 'PATCH' }),

    // Categorias
    categoryTree: () => authFetch<CategoryNode[]>('/categories/tree'),
    listCategories: (query: CategoryListQuery) =>
      authFetch<RawPage<Category>>('/categories/admin', { query: cleanQuery(query) }).then(toPage),
    createCategory: (data: CategoryRequest, image: File | null) => {
      // "data" debe ir como Blob JSON o Spring no la puede leer
      const body = new FormData()
      body.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
      if (image) body.append('image', image)
      return authFetch<Category>('/categories', { method: 'POST', body })
    },

    // Tallas
    listSizes: () => authFetch<Size[]>('/sizes'),
    listSizesPage: (query: AdminListQuery) =>
      authFetch<RawPage<Size>>('/sizes/admin', { query: cleanQuery(query) }).then(toPage),
    createSize: (body: SizeRequest) => authFetch<Size>('/sizes', { method: 'POST', body }),
    updateSize: (id: string, body: SizeRequest) => authFetch<Size>(`/sizes/${id}`, { method: 'PUT', body }),
    deleteSize: (id: string) => authFetch<null>(`/sizes/${id}`, { method: 'DELETE' }),

    // Colores
    listColors: () => authFetch<Color[]>('/colors'),
    listColorsPage: (query: AdminListQuery) =>
      authFetch<RawPage<Color>>('/colors/admin', { query: cleanQuery(query) }).then(toPage),
    createColor: (body: ColorRequest) => authFetch<Color>('/colors', { method: 'POST', body }),
    updateColor: (id: string, body: ColorRequest) => authFetch<Color>(`/colors/${id}`, { method: 'PUT', body }),
    deleteColor: (id: string) => authFetch<null>(`/colors/${id}`, { method: 'DELETE' }),
  }
}
