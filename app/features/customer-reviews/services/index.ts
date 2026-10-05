import { useCustomerFetch } from '~/features/customer-auth'
import { createMyReviewsApi } from './my-reviews.api'

export function useMyReviewsApi() {
  return createMyReviewsApi(useCustomerFetch())
}
