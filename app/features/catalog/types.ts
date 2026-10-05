// Contrato con /api/v1 para los catalogos previos a un articulo.

export interface TaxConfig {
  id: string
  name: string
  /** Tasa decimal: 0.16 = 16 %. */
  rate: number
  active: boolean
}

export interface Size {
  id: string
  name: string
  sortOrder: number
}

export interface Color {
  id: string
  name: string
  hex: string
}

export interface CategoryRef {
  id: string
  name: string
  slug: string
}

/** Nodo de GET /categories/tree (solo activas). */
export interface CategoryNode extends CategoryRef {
  description: unknown
  imageUrl: string | null
  active: boolean
  children: CategoryNode[]
  createdAt: string
  updatedAt: string
}

/** CategoryResponseDto de POST /categories y GET /categories/admin. */
export interface Category extends CategoryRef {
  description: unknown
  imageUrl: string | null
  active: boolean
  parent: CategoryRef | null
  createdAt: string
  updatedAt: string
}

export interface CategoryOption {
  id: string
  name: string
  depth: number
  /** "Mujer / Brasieres" */
  path: string
}
