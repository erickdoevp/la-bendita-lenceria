import { z } from 'zod'
import { useAddressesStore } from '~/features/addresses'
import type { Address } from '~/features/addresses'
import { DEV_TURNSTILE_TOKEN } from '~/features/auth'
import { GUEST_CART_TOKEN_KEY, useCustomerAuthStore } from '~/features/customer-auth'
import { useCartStore } from '~/features/store-cart'
import { CART_CONFLICT_PATTERN, CUSTOMER_PAYMENT_METHODS, GUEST_PAYMENT_METHODS, USE_CHECKOUT_MOCKS } from '../constants'
import type { MockOrderInput } from '../mocks/checkout.mock'
import { checkoutAddressSchema, couponCodeSchema, guestContactSchema, notesSchema } from '../schemas'
import { useCheckoutApi } from '../services'
import { useCheckoutStore } from '../stores/checkout.store'
import type { CheckoutAddress, CheckoutPaymentMethod, CouponPreview, DeliveryMode, ShippingOption, StoreLocation } from '../types'
import { estimateTotals, orderTotals } from '../utils/checkout-totals'
import type { PaymentGateway } from '../utils/payment-gateway'

export type CheckoutStep = 'idle' | 'validating' | 'creating' | 'paying' | 'confirming'

export const CHECKOUT_RESULT_PATH = '/pagar/confirmacion'

const toCheckoutAddress = (a: Address): CheckoutAddress => ({
  recipientName: a.recipientName,
  phone: a.phone,
  street: a.street,
  exteriorNumber: a.exteriorNumber,
  interiorNumber: a.interiorNumber,
  colonia: a.colonia,
  cp: a.cp,
  municipio: a.municipio,
  estado: a.estado,
})

function readGuestCartToken() {
  try {
    return localStorage.getItem(GUEST_CART_TOKEN_KEY)
  }
  catch {
    return null
  }
}

/**
 * Formulario de pago de una sola pagina. El orden de los pasos sigue FLUJO-CHECKOUT-Y-PAGOS:
 * validar la tarjeta, crear la orden (una sola vez), iniciar el pago (idempotente),
 * confirmar con la pasarela y dejar que la pagina de confirmacion consulte el resultado.
 */
export function useCheckoutForm() {
  const auth = useCustomerAuthStore()
  const cart = useCartStore()
  const addresses = useAddressesStore()
  const checkout = useCheckoutStore()
  const api = useCheckoutApi()
  const router = useRouter()
  const { public: { turnstileSiteKey } } = useRuntimeConfig()
  const { fieldErrors, formError, validate, applyApiError, clearField, reset } = useFormErrors()

  const isGuest = computed(() => !auth.isAuthenticated)
  const locked = computed(() => Boolean(checkout.order))

  const values = reactive({
    email: '',
    name: '',
    phone: '',
    mode: 'shipping' as DeliveryMode,
    addressId: null as string | null,
    /** La invitada captura la direccion aqui; quien recibe es ella salvo que diga otra cosa. */
    address: {
      recipientName: '',
      phone: '',
      street: '',
      exteriorNumber: '',
      interiorNumber: '',
      colonia: '',
      cp: '',
      municipio: '',
      estado: '',
    },
    otherRecipient: false,
    shippingConfigId: null as string | null,
    pickupLocationId: null as string | null,
    notes: '',
    paymentMethod: 'CARD' as CheckoutPaymentMethod,
  })

  // Turnstile: obligatorio para la invitada en produccion; en dev se manda "dev"
  const turnstile = {
    enabled: Boolean(turnstileSiteKey),
    siteKey: turnstileSiteKey,
    token: ref<string | null>(turnstileSiteKey ? null : DEV_TURNSTILE_TOKEN),
  }

  const step = ref<CheckoutStep>('idle')
  const paymentError = ref<string | null>(null)
  /** Stock o carrito cambiaron: se resuelve en la bolsa, no en el formulario. */
  const cartConflict = ref<string | null>(null)
  const notice = ref<string | null>(null)

  const paymentMethods = computed(() => (isGuest.value ? GUEST_PAYMENT_METHODS : CUSTOMER_PAYMENT_METHODS))
  watch(paymentMethods, (methods) => {
    if (!methods.includes(values.paymentMethod)) values.paymentMethod = 'CARD'
  })

  // --- Direcciones guardadas (solo con sesion) ---
  watch(() => auth.isAuthenticated, async (authenticated) => {
    if (!authenticated) return
    if (!addresses.loaded) await addresses.load()
    values.addressId ??= addresses.defaultAddress?.id ?? addresses.sorted[0]?.id ?? null
  }, { immediate: true })

  const selectedAddress = computed(() => addresses.items.find(a => a.id === values.addressId) ?? null)

  // --- Cupon (solo con sesion) ---
  const coupon = ref<CouponPreview | null>(null)
  const couponPending = ref(false)
  const couponError = ref<string | null>(null)

  async function applyCoupon(raw: string) {
    couponError.value = null
    const parsed = couponCodeSchema.safeParse(raw)
    if (!parsed.success) {
      couponError.value = parsed.error.issues[0]?.message ?? 'Revisa el código.'
      return false
    }
    couponPending.value = true
    try {
      coupon.value = await api.previewCoupon(parsed.data, cart.summary.subtotal)
      return true
    }
    catch (e) {
      couponError.value = parseApiError(e).message
      return false
    }
    finally {
      couponPending.value = false
    }
  }

  function removeCoupon() {
    coupon.value = null
    couponError.value = null
  }

  // --- Envio: depende del subtotal ya con descuento (seccion 5.0) ---
  const subtotal = computed(() => cart.summary.subtotal)
  const discount = computed(() => coupon.value?.discountAmount ?? 0)
  const shippingOptions = ref<ShippingOption[]>([])
  const shippingStatus = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
  let shippingRequest = 0

  async function loadShippingOptions() {
    if (locked.value || !cart.lines.length) return
    const id = ++shippingRequest
    shippingStatus.value = 'loading'
    try {
      const options = await api.shippingOptions(Math.max(0, subtotal.value - discount.value))
      if (id !== shippingRequest) return
      shippingOptions.value = options
      if (!options.some(o => o.id === values.shippingConfigId)) values.shippingConfigId = options[0]?.id ?? null
      shippingStatus.value = 'ready'
    }
    catch {
      if (id === shippingRequest) shippingStatus.value = 'error'
    }
  }

  watch(() => [subtotal.value - discount.value, cart.lines.length], loadShippingOptions, { immediate: true })

  const selectedShipping = computed(() => shippingOptions.value.find(o => o.id === values.shippingConfigId) ?? null)

  // --- Sucursales: se piden la primera vez que se elige recoger ---
  const locations = ref<StoreLocation[]>([])
  const locationsStatus = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')

  async function loadLocations() {
    locationsStatus.value = 'loading'
    try {
      locations.value = await api.storeLocations()
      values.pickupLocationId ??= locations.value[0]?.id ?? null
      locationsStatus.value = 'ready'
    }
    catch {
      locationsStatus.value = 'error'
    }
  }

  watch(() => values.mode, (mode) => {
    if (mode === 'pickup' && locationsStatus.value === 'idle') void loadLocations()
  })

  // --- Totales: estimados hasta que la orden existe; despues mandan los del backend ---
  const totals = computed(() => {
    if (checkout.order) return orderTotals(checkout.order)
    const shipping = values.mode === 'pickup' ? 0 : selectedShipping.value?.cost ?? null
    return estimateTotals(subtotal.value, discount.value, shipping)
  })

  // Al corregir un campo se borra su error
  watch(() => ({ ...values, address: { ...values.address } }), (now, before) => {
    for (const key of Object.keys(now) as (keyof typeof now)[]) {
      if (key === 'address') {
        for (const field of Object.keys(now.address) as (keyof typeof now.address)[]) {
          if (now.address[field] !== before.address[field]) clearField(`address.${field}`)
        }
      }
      else if (now[key] !== before[key]) {
        clearField(key)
      }
    }
  })

  function buildSchema() {
    const shipping = values.mode === 'shipping'
    return z.object({
      ...(isGuest.value ? guestContactSchema.shape : {}),
      ...(shipping && isGuest.value ? { address: checkoutAddressSchema } : {}),
      ...(shipping && !isGuest.value ? { addressId: z.string({ error: 'Elige o agrega una dirección de entrega.' }) } : {}),
      ...(shipping ? { shippingConfigId: z.string({ error: 'Elige un método de envío.' }) } : {}),
      ...(!shipping ? { pickupLocationId: z.string({ error: 'Elige dónde recoger tu pedido.' }) } : {}),
      notes: notesSchema,
    })
  }

  function validateForm() {
    // Si recibe la misma persona, la direccion lleva su nombre y telefono
    if (isGuest.value && !values.otherRecipient) {
      values.address.recipientName = values.name
      values.address.phone = values.phone
    }
    return validate(buildSchema(), values)
  }

  async function focusFirstError() {
    await nextTick()
    const field = document.querySelector<HTMLElement>('[aria-invalid="true"], [data-checkout-error]')
    field?.focus({ preventScroll: true })
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    field?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
  }

  async function createOrder(parsed: z.output<ReturnType<typeof buildSchema>>) {
    const pickup = values.mode === 'pickup'
    const notes = parsed.notes
    const address = pickup
      ? null
      : isGuest.value
        ? (parsed as { address: CheckoutAddress }).address
        : selectedAddress.value ? toCheckoutAddress(selectedAddress.value) : null

    const mockInput: MockOrderInput = {
      lines: cart.lines,
      pickup,
      address,
      shippingConfigId: pickup ? null : values.shippingConfigId,
      pickupLocationId: pickup ? values.pickupLocationId : null,
      couponCode: coupon.value?.code ?? null,
      notes,
      customer: auth.user ? { userId: auth.user.id } : null,
      guest: isGuest.value ? { email: values.email.trim(), name: values.name.trim(), phone: values.phone.trim() } : null,
    }

    const delivery = pickup
      ? { pickup: true, pickupLocationId: values.pickupLocationId! }
      : { pickup: false, shippingConfigId: values.shippingConfigId! }

    if (isGuest.value) {
      const guestToken = readGuestCartToken() ?? (USE_CHECKOUT_MOCKS ? 'mock-guest-cart' : '')
      try {
        const created = await api.createGuestOrder({
          ...delivery,
          guestToken,
          email: mockInput.guest!.email,
          name: mockInput.guest!.name,
          phone: mockInput.guest!.phone,
          ...(address ? { shippingAddress: address } : {}),
          notes,
          turnstileToken: turnstile.token.value ?? '',
        }, mockInput)
        await checkout.adopt(created)
      }
      finally {
        // Cada token de Turnstile sirve una sola vez
        if (turnstile.enabled) turnstile.token.value = null
      }
      return
    }

    const created = await api.createCustomerOrder({
      ...delivery,
      ...(values.addressId && !pickup ? { shippingAddressId: values.addressId } : {}),
      couponCode: coupon.value?.code ?? null,
      notes,
    }, mockInput)
    await checkout.adopt(created)
  }

  function resultUrl(orderId: string) {
    return `${window.location.origin}${CHECKOUT_RESULT_PATH}?pedido=${encodeURIComponent(orderId)}`
  }

  async function handleError(error: unknown) {
    const info = parseApiError(error)
    if (CART_CONFLICT_PATTERN.test(info.message)) {
      cartConflict.value = info.message
      await cart.reload()
      return
    }
    // La orden expiro o se cancelo mientras pagaba (seccion 12)
    if (/PENDING_PAYMENT/.test(info.message)) {
      checkout.forget()
      await cart.syncWithOrder('canceled')
      formError.value = 'Tu pedido expiró antes de completar el pago. Tus piezas regresaron a la bolsa: revisa los datos y vuelve a intentarlo.'
      return
    }
    if (/ya fue pagada/i.test(info.message) && checkout.order) {
      await router.push({ path: CHECKOUT_RESULT_PATH, query: { pedido: checkout.order.id } })
      return
    }
    applyApiError(error)
  }

  /** Paga: crea la orden si aun no existe y confirma el cobro con la pasarela. */
  async function submit(gateway: PaymentGateway | null) {
    if (step.value !== 'idle') return
    reset()
    paymentError.value = null
    cartConflict.value = null
    notice.value = null

    let parsed: z.output<ReturnType<typeof buildSchema>> | null = null
    if (!checkout.order) {
      parsed = validateForm()
      if (!parsed) {
        formError.value = 'Revisa los campos marcados.'
        await focusFirstError()
        return
      }
      if (isGuest.value && !turnstile.token.value) {
        formError.value = 'Completa la verificación de seguridad para continuar.'
        return
      }
    }

    const byCard = values.paymentMethod === 'CARD'
    try {
      // Stripe pide validar la tarjeta antes de cualquier trabajo asincrono
      if (byCard) {
        step.value = 'validating'
        const cardError = gateway ? await gateway.validate() : 'El formulario de pago todavía no carga. Espera un momento.'
        if (cardError) {
          paymentError.value = cardError
          return
        }
      }

      if (!checkout.order && parsed) {
        step.value = 'creating'
        await createOrder(parsed)
      }
      const order = checkout.order!

      step.value = 'paying'
      const payment = await api.initiatePayment(checkout.access!, values.paymentMethod)
      checkout.setPayment(payment)

      if (byCard && payment.status !== 'PAID') {
        step.value = 'confirming'
        const error = await gateway!.confirm(payment.stripeClientSecret ?? '', resultUrl(order.id))
        if (error) {
          // La orden y su stock apartado se conservan: se reintenta sobre la misma (seccion 9)
          paymentError.value = error
          return
        }
      }

      await router.push({ path: CHECKOUT_RESULT_PATH, query: { pedido: order.id } })
    }
    catch (error) {
      await handleError(error)
    }
    finally {
      step.value = 'idle'
    }
  }

  /** Cancelar la orden para cambiar entrega o cupon; las piezas vuelven a la bolsa. */
  const editing = ref(false)
  async function editOrder() {
    if (!checkout.order) return
    editing.value = true
    const number = checkout.order.orderNumber
    try {
      await checkout.cancel()
      paymentError.value = null
      notice.value = `Cancelamos el pedido ${number}. Tus piezas siguen en la bolsa: ajusta lo que necesites.`
      await loadShippingOptions()
    }
    catch (error) {
      await handleError(error)
    }
    finally {
      editing.value = false
    }
  }

  /** La ventana de pago termino: se confirma con el backend antes de avisar. */
  async function onExpired() {
    const order = await checkout.refresh().catch(() => null)
    if (order && order.status === 'PENDING_PAYMENT') return
    checkout.forget()
    await cart.syncWithOrder('canceled')
    paymentError.value = null
    formError.value = 'Se terminó el tiempo para pagar y liberamos tus piezas. Siguen en tu bolsa: puedes intentarlo de nuevo.'
    await loadShippingOptions()
  }

  return {
    values,
    isGuest,
    locked,
    step,
    fieldErrors,
    formError,
    paymentError,
    cartConflict,
    notice,
    turnstile,
    paymentMethods,
    addresses,
    selectedAddress,
    coupon,
    couponPending,
    couponError,
    applyCoupon,
    removeCoupon,
    shippingOptions,
    shippingStatus,
    selectedShipping,
    loadShippingOptions,
    locations,
    locationsStatus,
    loadLocations,
    totals,
    submit,
    editing,
    editOrder,
    onExpired,
  }
}

export type CheckoutForm = ReturnType<typeof useCheckoutForm>
