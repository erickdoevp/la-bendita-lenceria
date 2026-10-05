import { useProductApi } from '../services'

/** Producto por slug. data = null significa que no existe (404). */
export async function useProductDetail(slug: Ref<string>) {
  const api = useProductApi()
  const { data, error, refresh } = await useAsyncData(
    () => `product:${slug.value}`,
    () => api.bySlug(slug.value),
  )
  return { product: data, error, refresh }
}

/** Relacionados: no bloquean el render del producto. */
export function useRelatedProducts(productId: Ref<string>) {
  const api = useProductApi()
  const { data, status } = useAsyncData(
    () => `product-related:${productId.value}`,
    () => api.related(productId.value),
    { lazy: true, server: false },
  )
  return {
    products: data,
    loading: computed(() => status.value === 'pending' || status.value === 'idle'),
  }
}
