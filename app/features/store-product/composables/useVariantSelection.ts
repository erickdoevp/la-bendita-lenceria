import { LOW_STOCK_THRESHOLD, PRODUCT_QUERY_KEYS as K } from '../constants'
import type { ProductVariantOption, StoreProductDetail } from '../types'

export type SizeAvailability = 'available' | 'low' | 'soldout' | 'unavailable'

/**
 * Color y talla elegidos, guardados en la URL con replace (no llenan el historial).
 * El color arranca en el primero con stock; la talla la elige la clienta,
 * salvo que solo exista una.
 */
export function useVariantSelection(product: Ref<StoreProductDetail>) {
  const route = useRoute()
  const queryValue = (key: string) => {
    const value = route.query[key]
    return (Array.isArray(value) ? value[0] : value) ?? null
  }

  const variantsByColor = computed(() => {
    const map = new Map<string, ProductVariantOption[]>()
    for (const variant of product.value.variants) {
      map.set(variant.colorKey, [...(map.get(variant.colorKey) ?? []), variant])
    }
    return map
  })

  const colorSoldOut = (key: string) => (variantsByColor.value.get(key) ?? []).every(v => v.stock <= 0)

  const colorKey = computed(() => {
    const fromUrl = queryValue(K.color)
    if (fromUrl && product.value.colors.some(c => c.key === fromUrl)) return fromUrl
    return product.value.colors.find(c => !colorSoldOut(c.key))?.key ?? product.value.colors[0]?.key ?? null
  })

  const size = computed(() => {
    const fromUrl = queryValue(K.size)
    if (fromUrl && product.value.sizes.includes(fromUrl)) return fromUrl
    return product.value.sizes.length === 1 ? product.value.sizes[0]! : null
  })

  const color = computed(() => product.value.colors.find(c => c.key === colorKey.value) ?? null)

  const variantFor = (sizeValue: string) =>
    variantsByColor.value.get(colorKey.value ?? '')?.find(v => v.size === sizeValue) ?? null

  function availability(sizeValue: string): SizeAvailability {
    const variant = variantFor(sizeValue)
    if (!variant) return 'unavailable'
    if (variant.stock <= 0) return 'soldout'
    return variant.stock <= LOW_STOCK_THRESHOLD ? 'low' : 'available'
  }

  const variant = computed(() => (size.value ? variantFor(size.value) : null))
  const price = computed(() => variant.value?.price ?? product.value.price)
  const canPurchase = computed(() => Boolean(variant.value && variant.value.stock > 0))

  // Fotos del color elegido mas las generales; si el color no tiene fotos, todas
  const images = computed(() => {
    const forColor = product.value.images.filter(img => img.colorKey === colorKey.value || img.colorKey === null)
    return forColor.length ? forColor : product.value.images
  })

  function update(patch: Record<string, string | null>) {
    return navigateTo({ query: { ...route.query, ...patch } }, { replace: true })
  }

  return {
    color,
    colorKey,
    size,
    variant,
    price,
    images,
    canPurchase,
    availability,
    colorSoldOut,
    setColor: (key: string) => update({ [K.color]: key }),
    setSize: (value: string) => update({ [K.size]: value }),
  }
}

export type VariantSelection = ReturnType<typeof useVariantSelection>
