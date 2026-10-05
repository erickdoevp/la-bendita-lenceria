<script setup lang="ts">
import { STORE_ROUTES } from '~/features/store-catalog'
import { useCartStore } from '~/features/store-cart'
import { provideCheckoutForm } from '../composables/useCheckoutContext'
import { useCheckoutForm } from '../composables/useCheckoutForm'
import { useCheckoutStore } from '../stores/checkout.store'
import CheckoutContact from './CheckoutContact.vue'
import CheckoutDelivery from './CheckoutDelivery.vue'
import CheckoutOrderLock from './CheckoutOrderLock.vue'
import CheckoutPayment from './CheckoutPayment.vue'
import CheckoutSummary from './CheckoutSummary.vue'

const props = defineProps<{
  /** ?pedido= desde "Mis pedidos" para pagar una orden pendiente. */
  resumeOrderId: string | null
}>()

const cart = useCartStore()
const checkout = useCheckoutStore()
const form = useCheckoutForm()
provideCheckoutForm(form)

const { formError, notice, cartConflict, totals, locked } = form
const ready = ref(false)

onMounted(async () => {
  await Promise.all([cart.ensureLoaded(), checkout.resume(props.resumeOrderId)])
  ready.value = true
})

const isEmpty = computed(() => ready.value && !checkout.order && !cart.lines.length)
const pieces = computed(() => {
  const count = checkout.order ? checkout.order.items.reduce((sum, item) => sum + item.quantity, 0) : cart.count
  return `${count} ${count === 1 ? 'pieza' : 'piezas'}`
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-10 lg:pt-14">
    <div
      v-if="!ready"
      class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16"
      aria-busy="true"
      aria-label="Cargando el pago"
    >
      <div class="grid content-start gap-6">
        <UiSkeleton class="h-9 w-64" />
        <UiSkeleton class="h-40" />
        <UiSkeleton class="h-64" />
      </div>
      <UiSkeleton class="hidden h-96 lg:block" />
    </div>

    <div
      v-else-if="isEmpty"
      class="mx-auto grid max-w-md justify-items-center gap-5 py-20 text-center"
    >
      <span class="grid size-14 place-items-center rounded-2xl bg-accent/8 text-accent">
        <Icon
          name="ph:handbag-bold"
          class="size-6"
          aria-hidden="true"
        />
      </span>
      <div class="grid gap-2">
        <h1 class="text-2xl font-semibold tracking-tight text-ink">
          Tu bolsa está vacía
        </h1>
        <p class="text-sm leading-relaxed text-ink-muted">
          Agrega las piezas que te gusten y vuelve aquí para pagarlas.
        </p>
      </div>
      <UiButton :to="STORE_ROUTES.home">
        Ir a la tienda
      </UiButton>
    </div>

    <div
      v-else
      class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16 xl:gap-24"
    >
      <div class="min-w-0">
        <div class="hero-enter mb-8 grid gap-2 lg:mb-12">
          <h1 class="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            {{ locked ? 'Completa tu pago' : 'Finalizar compra' }}
          </h1>
          <p class="text-sm text-ink-muted">
            {{ pieces }} · Precios con IVA incluido
          </p>
        </div>

        <!-- En movil el resumen va arriba y plegado para no empujar el formulario -->
        <details class="group mb-8 rounded-xl border border-line bg-surface-raised lg:hidden">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 focus-visible:outline-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
            <span class="flex items-center gap-2 text-sm font-medium text-ink">
              <Icon
                name="ph:handbag-bold"
                class="size-4 text-ink-muted"
                aria-hidden="true"
              />
              <span class="group-open:hidden">Ver resumen</span>
              <span class="hidden group-open:inline">Ocultar resumen</span>
              <Icon
                name="ph:caret-down-bold"
                class="size-3.5 text-ink-muted transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </span>
            <span class="font-semibold tabular-nums text-ink">{{ formatMoney(totals.total) }}</span>
          </summary>
          <div class="border-t border-line px-4 py-5">
            <CheckoutSummary />
          </div>
        </details>

        <div
          aria-live="polite"
          class="grid gap-3 empty:hidden [&:not(:empty)]:mb-8"
        >
          <UiAlert
            v-if="notice"
            tone="info"
          >
            {{ notice }}
          </UiAlert>
          <div
            v-if="cartConflict"
            role="alert"
            class="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            <span>{{ cartConflict }}</span>
            <UiButton
              variant="secondary"
              size="sm"
              @click="cart.open()"
            >
              Revisar bolsa
            </UiButton>
          </div>
          <UiAlert
            v-if="formError"
            data-checkout-error
            tabindex="-1"
          >
            {{ formError }}
          </UiAlert>
        </div>

        <form
          novalidate
          @submit.prevent
        >
          <CheckoutOrderLock v-if="locked" />
          <template v-else>
            <CheckoutContact />
            <CheckoutDelivery />
          </template>
          <CheckoutPayment />
        </form>
      </div>

      <aside
        class="hidden lg:block"
        aria-label="Resumen del pedido"
      >
        <div class="sticky top-8 rounded-xl border border-line bg-surface-raised p-7">
          <CheckoutSummary />
        </div>
      </aside>
    </div>
  </div>
</template>
