/**
 * Lo unico que el checkout necesita de Stripe.js. Hoy lo implementa el formulario de
 * prueba (CheckoutTestCardForm); al integrar, CheckoutPaymentElement lo implementa con
 * el Payment Element en modo diferido, que se monta antes de que exista la orden:
 *
 *   const stripe = await loadStripe(config.publishableKey)          // GET /public/payments/config
 *   const elements = stripe.elements({ mode: 'payment', amount: Math.round(total * 100), currency: 'mxn' })
 *   elements.create('payment').mount(container)
 *
 *   validate: const { error } = await elements.submit()              // antes de POST /orders
 *   confirm:  const { error } = await stripe.confirmPayment({
 *               elements, clientSecret,
 *               confirmParams: { return_url: returnUrl },
 *               redirect: 'if_required',                           // 3D Secure u OXXO si redirigen
 *             })
 *
 * Si cambia el total (envio, cupon) hay que llamar elements.update({ amount }).
 */
export interface PaymentGateway {
  /** Valida los datos de pago sin cobrar. Devuelve el mensaje de error o null. */
  validate: () => Promise<string | null>
  /**
   * Confirma el cobro con el clientSecret de POST /payments/order/{id}. Que no haya
   * error NO significa pagado: el estado real se consulta al backend (seccion 8).
   */
  confirm: (clientSecret: string, returnUrl: string) => Promise<string | null>
}
