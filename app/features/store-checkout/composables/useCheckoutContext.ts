import type { InjectionKey } from 'vue'
import type { CheckoutForm } from './useCheckoutForm'

const CHECKOUT_FORM: InjectionKey<CheckoutForm> = Symbol('checkout-form')

/** La vista crea el formulario una vez y las secciones lo leen sin pasar props en cadena. */
export function provideCheckoutForm(form: CheckoutForm) {
  provide(CHECKOUT_FORM, form)
}

export function useCheckoutContext() {
  const form = inject(CHECKOUT_FORM)
  if (!form) throw new Error('useCheckoutContext debe usarse dentro de CheckoutView')
  return form
}
