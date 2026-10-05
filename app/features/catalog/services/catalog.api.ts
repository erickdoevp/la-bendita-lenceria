import type { useAuthFetch } from '~/features/auth'
import type { CategoryRequest, CategoryUpdateRequest, ColorRequest, SizeRequest, TaxRequest } from '../schemas'
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

/** "data" debe ir como Blob JSON o Spring no la puede leer. */
function toCategoryFormData(data: CategoryUpdateRequest, image: File | null) {
  const body = new FormData()
  body.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
  if (image) body.append('image', image)
  return body
}

export function createCatalogApi(authFetch: AuthFetch) {
  return {
    // Impuestos
    listTaxes: () => authFetch<TaxConfig[]>('/tax'),
    createTax: (body: TaxRequest) => authFetch<TaxConfig>('/tax', { method: 'POST', body }),
    updateTax: (id: string, body: TaxRequest) => authFetch<TaxConfig>(`/tax/${id}`, { method: 'PUT', body }),
    activateTax: (id: string) => authFetch<TaxConfig>(`/tax/${id}/activate`, { method: 'PATCH' }),

    // Categorias
    categoryTree: () => authFetch<CategoryNode[]>('/categories/tree'),
    listCategories: (query: CategoryListQuery) =>
      authFetch<RawPage<Category>>('/categories/admin', { query: cleanQuery(query) }).then(toPage),
    createCategory: (data: CategoryRequest, image: File | null) =>
      authFetch<Category>('/categories', { method: 'POST', body: toCategoryFormData(data, image) }),
    // Parcial: solo cambia lo que se manda; la imagen reemplaza a la anterior
    updateCategory: (id: string, data: CategoryUpdateRequest, image: File | null) =>
      authFetch<Category>(`/categories/${id}`, { method: 'PUT', body: toCategoryFormData(data, image) }),

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
