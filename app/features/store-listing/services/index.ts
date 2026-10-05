import { usePublicFetch } from '~/features/store-catalog'
import { createListingApi } from './listing.api'

export function useListingApi() {
  return createListingApi(usePublicFetch())
}
