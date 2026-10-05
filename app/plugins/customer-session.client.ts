import { useAddressesStore } from '~/features/addresses'
import { useCustomerAuthStore } from '~/features/customer-auth'
import { useMyOrdersStore } from '~/features/customer-orders'
import { useMyReviewsStore } from '~/features/customer-reviews'
import { useFiscalStore } from '~/features/fiscal-data'
import { useInvoicesStore } from '~/features/invoices'

/**
 * Al cargar la tienda se recupera la sesion del cliente (sin bloquear el render;
 * si falla se sigue como visitante). Al cambiar de usuario se vacian sus datos
 * para que otra cuenta en el mismo navegador no los vea ni un instante.
 */
export default defineNuxtPlugin(() => {
  const auth = useCustomerAuthStore()
  const route = useRoute()

  // El panel admin tiene su propia sesion: ahi no hace falta la del cliente
  if (!route.path.startsWith('/admin')) void auth.restoreSession()

  watch(() => auth.user?.id, (id, previous) => {
    if (!previous || id === previous) return
    useAddressesStore().$reset()
    useFiscalStore().$reset()
    useMyOrdersStore().$reset()
    useInvoicesStore().$reset()
    useMyReviewsStore().$reset()
  })
})
