import { useAuthFetch } from '~/features/auth'
import { createCatalogApi } from './catalog.api'

export function useCatalogApi() {
  return createCatalogApi(useAuthFetch())
}
