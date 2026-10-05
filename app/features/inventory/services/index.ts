import { useAuthFetch } from '~/features/auth'
import { createInventoryApi } from './inventory.api'

export function useInventoryApi() {
  return createInventoryApi(useAuthFetch())
}
