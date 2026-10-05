import { usePublicFetch } from '~/features/store-catalog'
import { createProductApi } from './product.api'

export function useProductApi() {
  return createProductApi(usePublicFetch())
}
