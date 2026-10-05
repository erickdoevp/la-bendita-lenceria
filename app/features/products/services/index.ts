import { useAuthFetch } from '~/features/auth'
import { createProductsApi } from './products.api'

export function useProductsApi() {
  return createProductsApi(useAuthFetch())
}
