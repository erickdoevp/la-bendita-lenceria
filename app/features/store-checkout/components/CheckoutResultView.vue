<script setup lang="ts">
import { ACCOUNT_ROUTES } from '~/features/account'
import { STORE_ROUTES } from '~/features/store-catalog'
import { useCartStore } from '~/features/store-cart'
import { useOrderResult } from '../composables/useOrderResult'
import type { OrderResultState } from '../composables/useOrderResult'

const props = defineProps<{ orderId: string | null }>()

const cart = useCartStore()
const { state, order, payment, isGuest, retry } = useOrderResult(() => props.orderId)

const retryTo = computed(() => ({ path: STORE_ROUTES.checkout, query: { pedido: props.orderId ?? undefined } }))

const HEADINGS: Record<Exclude<OrderResultState, 'loading'>, { icon: string, tone: string, title: string }> = {
  'checking': { icon: 'ph:circle-notch-bold', tone: 'bg-surface text-ink-muted', title: 'Estamos confirmando tu pago' },
  'paid': { icon: 'ph:check-bold', tone: 'bg-success-soft text-success', title: 'Gracias, tu pedido está confirmado' },
  'manual': { icon: 'ph:hourglass-medium-bold', tone: 'bg-warning-soft text-warning', title: 'Tu pedido está apartado' },
  'failed': { icon: 'ph:x-bold', tone: 'bg-danger-soft text-danger', title: 'No pudimos cobrar tu tarjeta' },
  'canceled': { icon: 'ph:clock-counter-clockwise-bold', tone: 'bg-surface text-ink-muted', title: 'Este pedido ya no está activo' },
  'slow': { icon: 'ph:hourglass-medium-bold', tone: 'bg-warning-soft text-warning', title: 'Seguimos procesando tu pago' },
  'not-found': { icon: 'ph:magnifying-glass-bold', tone: 'bg-surface text-ink-muted', title: 'No encontramos este pedido' },
}

const heading = computed(() => (state.value === 'loading' ? HEADINGS.checking : HEADINGS[state.value]))

const lead = computed(() => {
  switch (state.value) {
    case 'loading':
    case 'checking':
      return 'Tarda unos segundos. No cierres ni recargues esta página.'
    case 'paid':
      if (!order.value?.pickup) return 'Ya estamos preparando tu envío.'
      return isGuest.value
        ? 'Cuando esté listo para recoger, vuelve a esta página para ver tu código.'
        : 'Cuando esté listo verás en Mis pedidos el código para recogerlo.'
    case 'manual':
      return payment.value?.method === 'BANK_TRANSFER'
        ? 'Haz la transferencia con estos datos. Preparamos tu pedido en cuanto se refleje el pago.'
        : order.value?.pickup ? 'Pagas en efectivo al recogerlo en la sucursal.' : 'Pagas en efectivo al recibirlo.'
    case 'failed':
      return payment.value?.failureMessage ?? 'El banco rechazó el cargo.'
    case 'canceled':
      return 'Se canceló o se terminó el tiempo para pagarlo. Tus piezas regresaron a la bolsa.'
    case 'slow':
      return 'Tu banco está tardando en responder. El cobro pudo haberse hecho: no vuelvas a pagar todavía.'
    default:
      return 'Puede que el enlace esté incompleto o que el pedido se haya hecho en otro navegador.'
  }
})

const address = computed(() => {
  const a = order.value?.shippingAddress
  if (!a) return null
  return [`${a.street} ${a.exteriorNumber}${a.interiorNumber ? ` int. ${a.interiorNumber}` : ''}, ${a.colonia}`, `${a.cp} ${a.municipio}, ${a.estado}`]
})

const showOrder = computed(() => order.value && ['paid', 'manual', 'checking', 'slow'].includes(state.value))

// TODO: datos bancarios de ejemplo; reemplazar por la cuenta real de la tienda
const BANK = { bank: 'BBVA México', holder: 'La Bendita Lencería S.A. de C.V.', clabe: '012 320 01234567890 1' }
</script>

<template>
  <div class="mx-auto grid max-w-2xl gap-10 px-4 pb-24 pt-12 sm:px-6 lg:pt-20">
    <div
      class="hero-enter grid justify-items-center gap-5 text-center"
      aria-live="polite"
    >
      <span
        class="grid size-14 place-items-center rounded-2xl"
        :class="heading.tone"
      >
        <Icon
          :name="heading.icon"
          class="size-6"
          :class="(state === 'loading' || state === 'checking') && 'motion-safe:animate-spin'"
          aria-hidden="true"
        />
      </span>
      <div class="grid gap-3">
        <p
          v-if="order"
          class="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-muted"
        >
          Pedido {{ order.orderNumber }}
        </p>
        <h1 class="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {{ heading.title }}
        </h1>
        <p class="mx-auto max-w-[46ch] leading-relaxed text-ink-muted">
          {{ lead }}
        </p>
      </div>

      <div class="flex flex-wrap justify-center gap-2">
        <template v-if="state === 'failed'">
          <UiButton
            :to="retryTo"
            icon="ph:credit-card-bold"
          >
            Intentar de nuevo
          </UiButton>
          <UiButton
            variant="secondary"
            :to="STORE_ROUTES.home"
          >
            Volver a la tienda
          </UiButton>
        </template>
        <template v-else-if="state === 'canceled'">
          <UiButton @click="cart.open()">
            Ver mi bolsa
          </UiButton>
          <UiButton
            variant="secondary"
            :to="STORE_ROUTES.checkout"
          >
            Pagar de nuevo
          </UiButton>
        </template>
        <UiButton
          v-else-if="state === 'slow'"
          variant="secondary"
          icon="ph:arrow-clockwise-bold"
          @click="retry"
        >
          Consultar de nuevo
        </UiButton>
        <template v-else-if="state === 'paid' || state === 'manual'">
          <UiButton
            v-if="!isGuest && order"
            :to="ACCOUNT_ROUTES.orderDetail(order.id)"
          >
            Ver mi pedido
          </UiButton>
          <UiButton
            :variant="isGuest ? 'primary' : 'secondary'"
            :to="STORE_ROUTES.home"
          >
            Seguir comprando
          </UiButton>
        </template>
        <UiButton
          v-else-if="state === 'not-found'"
          :to="STORE_ROUTES.home"
        >
          Ir a la tienda
        </UiButton>
      </div>
    </div>

    <dl
      v-if="state === 'manual' && payment?.method === 'BANK_TRANSFER' && order"
      class="reveal grid gap-3 rounded-xl border border-line bg-surface-raised p-6 text-sm sm:grid-cols-2"
    >
      <div class="grid gap-0.5">
        <dt class="text-ink-muted">
          Banco
        </dt>
        <dd class="font-medium text-ink">
          {{ BANK.bank }}
        </dd>
      </div>
      <div class="grid gap-0.5">
        <dt class="text-ink-muted">
          Titular
        </dt>
        <dd class="font-medium text-ink">
          {{ BANK.holder }}
        </dd>
      </div>
      <div class="grid gap-0.5">
        <dt class="text-ink-muted">
          CLABE
        </dt>
        <dd class="font-mono font-medium tabular-nums text-ink">
          {{ BANK.clabe }}
        </dd>
      </div>
      <div class="grid gap-0.5">
        <dt class="text-ink-muted">
          Referencia
        </dt>
        <dd class="font-mono font-medium text-ink">
          {{ order.orderNumber }}
        </dd>
      </div>
      <div class="grid gap-0.5 sm:col-span-2">
        <dt class="text-ink-muted">
          Monto exacto
        </dt>
        <dd class="text-lg font-semibold tabular-nums text-ink">
          {{ formatMoney(order.total) }}
        </dd>
      </div>
    </dl>

    <section
      v-if="showOrder && order"
      aria-label="Detalle del pedido"
      class="reveal grid gap-6 rounded-xl border border-line bg-surface-raised p-6 sm:p-8"
    >
      <ul class="grid gap-4">
        <li
          v-for="item in order.items"
          :key="item.id"
          class="flex items-center gap-3.5"
        >
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            alt=""
            width="56"
            height="72"
            class="aspect-[7/9] w-14 shrink-0 rounded-lg border border-line object-cover"
          >
          <span class="grid min-w-0 flex-1 gap-0.5">
            <span class="truncate text-sm font-medium text-ink">{{ item.productName }}</span>
            <span class="truncate text-[13px] text-ink-muted">
              {{ [item.colorName, `Talla ${item.sizeName}`].filter(Boolean).join(' · ') }} · {{ item.quantity }} {{ item.quantity === 1 ? 'pieza' : 'piezas' }}
            </span>
          </span>
          <span class="shrink-0 text-sm font-medium tabular-nums text-ink">{{ formatMoney(item.subtotal) }}</span>
        </li>
      </ul>

      <dl class="grid gap-5 border-t border-line pt-6 text-sm sm:grid-cols-2">
        <div class="grid content-start gap-1">
          <dt class="text-ink-muted">
            {{ order.pickup ? 'Recoges en' : `Envío ${order.shippingConfigName?.toLowerCase() ?? ''}` }}
          </dt>
          <dd
            v-if="order.pickup"
            class="text-ink"
          >
            {{ order.pickupLocationName }}
            <span
              v-if="order.pickupCode"
              class="mt-1 block font-mono text-base font-semibold tracking-[0.1em]"
            >Código: {{ order.pickupCode }}</span>
          </dd>
          <dd
            v-else-if="address"
            class="grid text-ink"
          >
            <span
              v-for="text in address"
              :key="text"
            >{{ text }}</span>
          </dd>
        </div>
        <div class="grid content-start gap-1.5">
          <div class="flex justify-between gap-4">
            <dt class="text-ink-muted">
              Subtotal
            </dt>
            <dd class="tabular-nums text-ink">
              {{ formatMoney(order.subtotal) }}
            </dd>
          </div>
          <div
            v-if="order.discountAmount > 0"
            class="flex justify-between gap-4"
          >
            <dt class="text-ink-muted">
              Descuento
            </dt>
            <dd class="tabular-nums text-success">
              −{{ formatMoney(order.discountAmount) }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-ink-muted">
              Envío
            </dt>
            <dd class="tabular-nums text-ink">
              {{ order.shippingCost ? formatMoney(order.shippingCost) : 'Gratis' }}
            </dd>
          </div>
          <div class="flex justify-between gap-4 border-t border-line pt-2 font-semibold">
            <dt class="text-ink">
              Total
            </dt>
            <dd class="tabular-nums text-ink">
              {{ formatMoney(order.total) }}
            </dd>
          </div>
        </div>
      </dl>
    </section>

    <!-- La invitada no tiene "Mis pedidos" ni recibe correos todavia (secciones 13 y 14) -->
    <p
      v-if="isGuest && (state === 'paid' || state === 'slow') && order"
      class="reveal flex items-start gap-3 rounded-xl bg-surface-raised px-5 py-4 text-sm leading-relaxed text-ink ring-1 ring-line"
    >
      <Icon
        name="ph:bookmark-simple-bold"
        class="mt-0.5 size-4 shrink-0 text-accent"
        aria-hidden="true"
      />
      <span>
        Guarda tu número de pedido <strong class="font-semibold">{{ order.orderNumber }}</strong>.
        Puedes volver a esta página desde este navegador para revisar el estado. Si creas una cuenta, tus próximas compras quedarán en “Mis pedidos”.
      </span>
    </p>
    <p
      v-else-if="!isGuest && state === 'paid'"
      class="text-center text-[13px] text-ink-muted"
    >
      ¿Necesitas factura? Solicítala desde
      <NuxtLink
        :to="ACCOUNT_ROUTES.invoices"
        class="font-medium text-ink underline underline-offset-4"
      >Mis facturas</NuxtLink>.
    </p>
  </div>
</template>
