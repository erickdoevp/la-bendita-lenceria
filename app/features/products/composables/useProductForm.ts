import type { InjectionKey } from 'vue'
import type { RichTextDoc } from '~/utils/rich-text'
import type { ProductStatus } from '../types'

/** Campos generales del articulo tal cual los editan los inputs. */
export interface ProductFormFields {
  name: string
  slug: string
  description: RichTextDoc | undefined
  basePrice: number | string
  categoryId: string
  taxConfigId: string
  status: ProductStatus
}

/**
 * Lo que necesitan las secciones generales (basicos, precio, publicacion).
 * Lo proveen el alta (borrador) y la edicion, cada una con su store.
 */
export interface ProductFormContext {
  mode: 'create' | 'edit'
  form: ProductFormFields
  fieldErrors: Record<string, string>
}

const PRODUCT_FORM_KEY: InjectionKey<ProductFormContext> = Symbol('product-form')

export const emptyProductForm = (): ProductFormFields => ({
  name: '',
  slug: '',
  description: undefined,
  basePrice: '',
  categoryId: '',
  taxConfigId: '',
  status: 'DRAFT',
})

/** `store` es un store de Pinia con `form` y `fieldErrors` (este ultimo como ref). */
export function provideProductForm(mode: ProductFormContext['mode'], store: { form: ProductFormFields, fieldErrors: Record<string, string> }) {
  provide(PRODUCT_FORM_KEY, reactive({
    mode,
    form: store.form,
    fieldErrors: toRef(store, 'fieldErrors'),
  }))
}

export function useProductForm(): ProductFormContext {
  const context = inject(PRODUCT_FORM_KEY, null)
  if (!context) throw new Error('useProductForm requiere provideProductForm en un componente padre.')
  return context
}
