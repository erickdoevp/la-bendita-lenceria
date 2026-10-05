import { defineStore } from 'pinia'
import type { RichTextDoc } from '~/utils/rich-text'
import { emptyProductForm, type ProductFormFields } from '../composables/useProductForm'
import { productUpdateSchema, type ProductUpdatePayload } from '../schemas'
import { useProductsApi } from '../services'
import type { ProductDetail, ProductUpdateRequest } from '../types'

/** La descripcion llega como JSON libre; las antiguas pueden ser texto plano. */
function toEditorDoc(description: unknown): RichTextDoc | undefined {
  if (typeof description === 'string') return toRichTextDoc(description)
  if (description && typeof description === 'object') return normalizeRichTextDoc(description as RichTextDoc)
  return undefined
}

const sameDoc = (a: RichTextDoc | undefined, b: RichTextDoc | undefined) =>
  JSON.stringify(normalizeRichTextDoc(a) ?? null) === JSON.stringify(normalizeRichTextDoc(b) ?? null)

/**
 * PATCH con solo lo que cambio. El slug va unicamente si es distinto al actual:
 * mandar el mismo hace que el backend lo vea "ocupado" y lo vuelva "slug-2".
 */
function buildPatch(payload: ProductUpdatePayload, product: ProductDetail): ProductUpdateRequest {
  const patch: ProductUpdateRequest = {}
  if (payload.name !== product.name) patch.name = payload.name
  if (payload.slug && payload.slug !== product.slug) patch.slug = payload.slug
  if (!sameDoc(payload.description, toEditorDoc(product.description))) {
    // null no borra en el backend: un documento vacio si
    patch.description = payload.description ?? EMPTY_RICH_TEXT
  }
  if (payload.basePrice !== product.basePrice) patch.basePrice = payload.basePrice
  if (payload.categoryId !== product.category.id) patch.categoryId = payload.categoryId
  if (payload.taxConfigId && payload.taxConfigId !== product.taxConfigId) patch.taxConfigId = payload.taxConfigId
  if (payload.status !== product.status) patch.status = payload.status
  return patch
}

/**
 * Detalle de un articulo en el panel. Los datos generales se editan como
 * formulario (guardar/descartar); variantes e imagenes se guardan al momento
 * y luego se recarga el detalle para traer stock e imagenes efectivas.
 */
export const useProductEditStore = defineStore('product-edit', () => {
  const api = useProductsApi()
  const { fieldErrors, formError, validate, applyApiError, clearField, reset: resetErrors } = useFormErrors()

  const product = ref<ProductDetail | null>(null)
  const pending = ref(false)
  const error = ref<ApiErrorInfo | null>(null)
  const saving = ref(false)

  const form = reactive(emptyProductForm())
  const snapshot = ref('')
  const serialize = () => JSON.stringify({ ...form, description: normalizeRichTextDoc(form.description) ?? null })
  const isDirty = computed(() => Boolean(product.value) && serialize() !== snapshot.value)

  function fillForm(detail: ProductDetail) {
    Object.assign(form, {
      name: detail.name,
      slug: detail.slug,
      description: toEditorDoc(detail.description),
      basePrice: detail.basePrice,
      categoryId: detail.category?.id ?? '',
      taxConfigId: detail.taxConfigId ?? '',
      status: detail.status,
    } satisfies ProductFormFields)
    snapshot.value = serialize()
    resetErrors()
  }

  for (const field of Object.keys(emptyProductForm()) as (keyof ProductFormFields)[]) {
    watch(() => form[field], () => clearField(field))
  }

  async function load(productId: string) {
    pending.value = true
    error.value = null
    product.value = null
    try {
      const detail = await api.get(productId)
      product.value = detail
      fillForm(detail)
    }
    catch (e) {
      error.value = parseApiError(e)
    }
    finally {
      pending.value = false
    }
  }

  /** Recarga tras cambiar variantes o imagenes. No toca el formulario en curso. */
  async function refresh() {
    if (!product.value) return
    product.value = await api.get(product.value.id)
  }

  function discard() {
    if (product.value) fillForm(product.value)
  }

  async function save(): Promise<boolean> {
    const current = product.value
    if (!current) return false

    const payload = validate(productUpdateSchema, form)
    if (!payload) {
      formError.value = 'Revisa los campos marcados antes de guardar.'
      return false
    }
    // El backend responde 422; mejor explicarlo junto al campo
    if (payload.status === 'PUBLISHED' && current.status !== 'PUBLISHED' && !current.variants.some(v => v.active)) {
      fieldErrors.value = { status: 'Para publicar necesitas al menos una variante activa.' }
      formError.value = 'Revisa los campos marcados antes de guardar.'
      return false
    }

    const patch = buildPatch(payload, current)
    if (!Object.keys(patch).length) {
      fillForm(current)
      return true
    }

    saving.value = true
    try {
      const saved = await api.update(current.id, patch)
      product.value = saved
      fillForm(saved)
      return true
    }
    catch (e) {
      applyApiError(e, { conflict: 'Ya existe otro artículo con ese slug.' })
      return false
    }
    finally {
      saving.value = false
    }
  }

  return {
    product,
    pending,
    error,
    saving,
    form,
    fieldErrors,
    formError,
    isDirty,
    load,
    refresh,
    discard,
    save,
  }
})
