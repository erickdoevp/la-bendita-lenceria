import { defineStore } from 'pinia'
import type { Review } from '~/features/reviews'
import type { ReviewRequest } from '../schemas'
import { useMyReviewsApi } from '../services'

/** "Mis reseñas". Tambien sirve para saber si ya reseñó un producto (RESENAS 5.1). */
export const useMyReviewsStore = defineStore('customer-reviews', () => {
  const api = useMyReviewsApi()
  const items = ref<Review[]>([])
  const loaded = ref(false)
  const pending = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    pending.value = true
    error.value = null
    try {
      items.value = await api.list()
      loaded.value = true
    }
    catch (e) {
      error.value = parseApiError(e).message
    }
    finally {
      pending.value = false
    }
  }

  function findByProduct(productId: string) {
    return items.value.find(r => r.productId === productId) ?? null
  }

  async function update(id: string, body: ReviewRequest) {
    const review = await api.update(id, body)
    items.value = items.value.map(r => (r.id === id ? review : r))
    return review
  }

  async function remove(id: string) {
    await api.remove(id)
    items.value = items.value.filter(r => r.id !== id)
  }

  function $reset() {
    items.value = []
    loaded.value = false
    error.value = null
  }

  return { items, loaded, pending, error, load, findByProduct, update, remove, $reset }
})
