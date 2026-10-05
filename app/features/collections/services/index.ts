import { useAuthFetch } from '~/features/auth'
import { createCollectionsApi } from './collections.api'

export function useCollectionsApi() {
  return createCollectionsApi(useAuthFetch())
}
