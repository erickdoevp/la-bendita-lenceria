// Contenido de la pagina de inicio. Cada seccion se carga por separado para que
// un fallo del backend en una no tumbe las demas.
import type { StoreProduct } from '~/features/store-catalog'

export type { StoreProduct }

/** Categoria tal cual la devuelve GET /categories/roots. */
export interface CategoryResponseDto {
  id: string
  name: string
  slug: string
  /** Documento TipTap o null. */
  description: unknown
  imageUrl: string | null
  active: boolean
  parent: { id: string, name: string, slug: string } | null
  createdAt: string
  updatedAt: string
}

/** Categoria destacada en el inicio (deriva de CategoryResponseDto). */
export interface HomeCategory {
  id: string
  name: string
  /** Camino de slugs desde la raiz: ['lenceria', 'brasieres']. */
  slugs: string[]
  imageUrl: string | null
  /** Frase corta bajo el nombre. */
  summary: string | null
}

/** Coleccion activa (deriva de Collection, ordenada por position). */
export interface HomeCollection {
  id: string
  name: string
  slug: string
  imageUrl: string
  /** Texto plano extraido de la descripcion rich text. */
  summary: string
  productCount: number
}

export interface HomeHeroContent {
  eyebrow: string
  title: string
  /** Palabra del titulo que se resalta con el color de acento. */
  highlight: string
  subtitle: string
  primaryCta: { label: string, to: string }
  secondaryCta: { label: string, to: string }
  image: { src: string, alt: string }
  detailImage: { src: string, alt: string }
}
