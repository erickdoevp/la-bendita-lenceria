import { useAuthFetch } from '~/features/auth'
import { createReviewsApi } from './reviews.api'

export function useReviewsApi() {
  return createReviewsApi(useAuthFetch())
}
