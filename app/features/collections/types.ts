// Contrato con /api/v1/collections (ver COLECCIONES.txt).
import type { RichTextDoc } from '~/utils/rich-text'

/** CollectionResponse: listados, crear y editar. */
export interface Collection {
  id: string
  name: string
  slug: string
  /** JSON libre del editor (TipTap) o null. */
  description: unknown
  imageUrl: string | null
  active: boolean
  /** Orden en la tienda: menor = primero. */
  position: number
  /** En admin cuenta TODOS los productos, incluidos borradores y archivados. */
  productCount: number
  createdAt: string
  updatedAt: string
}

/** Resumen de producto dentro de una coleccion: no trae status ni variantes. */
export interface CollectionProduct {
  id: string
  name: string
  slug: string
  basePrice: number
  primaryImageUrl: string | null
}

/** CollectionDetailResponse: detalle y todas las operaciones de productos. No trae productCount. */
export interface CollectionDetail extends Omit<Collection, 'productCount'> {
  /** En el orden de la coleccion. */
  products: CollectionProduct[]
}

/** Parte "data" del multipart. En PUT es parcial: omitido = sin cambio. */
export interface CollectionRequest {
  name?: string
  slug?: string
  description?: RichTextDoc
  active?: boolean
  position?: number
}
