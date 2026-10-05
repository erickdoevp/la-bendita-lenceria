import type { CustomerFetch } from '~/features/customer-auth'
import type { Review } from '~/features/reviews'
import type { ReviewRequest } from '../schemas'

export function createMyReviewsApi(customerFetch: CustomerFetch) {
  return {
    /** Sin paginar, de la mas reciente a la mas vieja. */
    list: () => customerFetch<Review[]>('/reviews/me'),
    /** Vuelve a moderacion: approved = false. */
    update: (id: string, body: ReviewRequest) =>
      customerFetch<Review>(`/reviews/me/${id}`, { method: 'PUT', body }),
    remove: (id: string) => customerFetch<null>(`/reviews/me/${id}`, { method: 'DELETE' }),
  }
}
