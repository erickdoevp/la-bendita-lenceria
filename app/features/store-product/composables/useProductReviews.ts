import { useProductApi } from '../services'
import type { ProductReview } from '../types'

/** Resenas con "Ver mas": cada pagina se agrega a la lista. Se piden en el cliente. */
export function useProductReviews(productId: Ref<string>, slug: Ref<string>) {
  const api = useProductApi()
  const items = ref<ProductReview[]>([])
  const page = ref(0)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const pending = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  async function loadPage(next: number) {
    pending.value = true
    error.value = null
    try {
      const result = await api.reviews(productId.value, slug.value, next)
      items.value = next === 1 ? result.items : [...items.value, ...result.items]
      page.value = result.page
      totalPages.value = result.totalPages
      totalItems.value = result.totalItems
      loaded.value = true
    }
    catch (e) {
      error.value = parseApiError(e).message
    }
    finally {
      pending.value = false
    }
  }

  // Al cambiar de producto (navegando entre relacionados) se empieza de cero
  watch(productId, () => {
    items.value = []
    loaded.value = false
    loadPage(1)
  })
  onMounted(() => loadPage(1))

  return {
    items,
    totalItems,
    pending,
    error,
    loaded,
    hasMore: computed(() => page.value < totalPages.value),
    loadMore: () => loadPage(page.value + 1),
    retry: () => loadPage(Math.max(1, page.value + (loaded.value ? 1 : 0))),
  }
}
