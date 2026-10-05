import { defineStore } from 'pinia'
import { getFieldErrors } from '#shared/utils/validation'
import { useSizesStore } from '~/features/catalog'
import { productFilesSchema, productSchema } from '../schemas'
import { useProductsApi } from '../services'
import type { ProductDetail, ProductStatus, VariantDraft } from '../types'
import { buildProductFormData } from '../utils/form-data'

type VariantField = 'sku' | 'priceAdjustment' | 'costPrice' | 'initialStock'

const variantKey = (colorId: string, sizeId: string) => `${colorId}:${sizeId}`

const initialForm = () => ({
  name: '',
  slug: '',
  description: '',
  basePrice: '' as number | string,
  categoryId: '',
  taxConfigId: '',
  status: 'DRAFT' as ProductStatus,
})

/**
 * Borrador del articulo nuevo. Vive en Pinia para no perderlo si la admin sale
 * a crear una talla o categoria y vuelve; se limpia al crear el articulo.
 */
export const useProductDraftStore = defineStore('product-draft', () => {
  const api = useProductsApi()
  const sizes = useSizesStore()

  const form = reactive(initialForm())
  const sizeIds = ref<string[]>([])
  const colorIds = ref<string[]>([])
  /** Combinaciones quitadas a mano (p. ej. no hay Negro en XS). */
  const excludedKeys = ref<string[]>([])
  const variants = ref<VariantDraft[]>([])
  const generalImages = ref<File[]>([])
  const colorImages = ref<Record<string, File[]>>({})
  const skuPreviews = ref<Record<string, string>>({})

  const fieldErrors = ref<Record<string, string>>({})
  const formError = ref<string | null>(null)
  const submitting = ref(false)
  const created = ref<ProductDetail | null>(null)

  /** Colores con al menos una variante: solo esos aceptan galeria propia. */
  const variantColorIds = computed(() => [...new Set(variants.value.map(v => v.colorId))])

  const isDirty = computed(() =>
    Boolean(form.name || form.basePrice || form.categoryId || variants.value.length || generalImages.value.length),
  )

  // ---- Variantes -----------------------------------------------------------

  /** Reconstruye la matriz color x talla conservando lo ya capturado. */
  function syncVariants() {
    const order = new Map(sizes.items.map((size, index) => [size.id, index]))
    const orderedSizes = [...sizeIds.value].sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0))
    const current = new Map(variants.value.map(v => [v.key, v]))
    const excluded = new Set(excludedKeys.value)

    variants.value = colorIds.value.flatMap(colorId => orderedSizes
      .map(sizeId => variantKey(colorId, sizeId))
      .filter(key => !excluded.has(key))
      .map((key) => {
        const [colorId, sizeId] = key.split(':') as [string, string]
        return current.get(key) ?? {
          key, sizeId, colorId, sku: '', priceAdjustment: 0, costPrice: 0, initialStock: 0, image: null,
        }
      }))
    clearErrors('variants')
  }

  function toggle(list: Ref<string[]>, id: string, position: 0 | 1) {
    if (list.value.includes(id)) {
      list.value = list.value.filter(item => item !== id)
      // Al quitar y volver a agregar una talla/color, sus combinaciones regresan
      excludedKeys.value = excludedKeys.value.filter(key => key.split(':')[position] !== id)
    }
    else {
      list.value = [...list.value, id]
    }
    syncVariants()
  }

  const toggleSize = (id: string) => toggle(sizeIds, id, 1)
  const toggleColor = (id: string) => toggle(colorIds, id, 0)

  function removeVariant(key: string) {
    excludedKeys.value = [...excludedKeys.value, key]
    syncVariants()
  }

  function restoreVariants() {
    excludedKeys.value = []
    syncVariants()
  }

  function applyToAll(values: Partial<Record<Exclude<VariantField, 'sku'>, number>>) {
    variants.value = variants.value.map(v => ({ ...v, ...values }))
    clearErrors('variants')
  }

  // ---- Errores -------------------------------------------------------------

  function clearError(field: string) {
    if (!(field in fieldErrors.value)) return
    const { [field]: _removed, ...rest } = fieldErrors.value
    fieldErrors.value = rest
  }

  /** Quita todos los errores cuyo campo empiece por `prefix` ("variants", "colorImages"). */
  function clearErrors(prefix: string) {
    fieldErrors.value = Object.fromEntries(Object.entries(fieldErrors.value).filter(([key]) => !key.startsWith(prefix)))
  }

  for (const field of Object.keys(initialForm()) as (keyof ReturnType<typeof initialForm>)[]) {
    watch(() => form[field], () => {
      clearError(field)
      if (field === 'status') clearError('variants')
    })
  }
  watch(generalImages, () => clearError('images'))

  // ---- Envio ---------------------------------------------------------------

  async function submit(): Promise<boolean> {
    formError.value = null
    const product = productSchema.safeParse({ ...form, variants: variants.value })
    const files = productFilesSchema.safeParse({
      images: generalImages.value,
      colorImages: Object.fromEntries(variantColorIds.value.map(id => [id, colorImages.value[id] ?? []])),
      variantImages: variants.value.map(v => v.image),
    })

    if (!product.success || !files.success) {
      fieldErrors.value = {
        ...(product.success ? {} : getFieldErrors(product.error)),
        ...(files.success ? {} : getFieldErrors(files.error)),
      }
      formError.value = 'Revisa los campos marcados antes de crear el artículo.'
      return false
    }

    submitting.value = true
    fieldErrors.value = {}
    try {
      created.value = await api.create(buildProductFormData(product.data, files.data))
      return true
    }
    catch (error) {
      const info = parseApiError(error, {
        conflict: 'Hay un SKU que ya existe en otro artículo. Cámbialo o déjalo vacío para generarlo.',
      })
      fieldErrors.value = info.fieldErrors
      formError.value = Object.keys(info.fieldErrors).length ? 'El servidor rechazó algunos campos. Revisa los marcados.' : info.message
      return false
    }
    finally {
      submitting.value = false
    }
  }

  function reset() {
    Object.assign(form, initialForm())
    sizeIds.value = []
    colorIds.value = []
    excludedKeys.value = []
    variants.value = []
    generalImages.value = []
    colorImages.value = {}
    skuPreviews.value = {}
    fieldErrors.value = {}
    formError.value = null
    created.value = null
  }

  return {
    form,
    sizeIds,
    colorIds,
    excludedKeys,
    variants,
    generalImages,
    colorImages,
    skuPreviews,
    fieldErrors,
    formError,
    submitting,
    created,
    variantColorIds,
    isDirty,
    toggleSize,
    toggleColor,
    removeVariant,
    restoreVariants,
    applyToAll,
    clearError,
    clearErrors,
    submit,
    reset,
  }
})
