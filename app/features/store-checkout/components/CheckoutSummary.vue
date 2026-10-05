<script setup lang="ts">
import { useCartStore } from '~/features/store-cart'
import { useCheckoutContext } from '../composables/useCheckoutContext'
import { useCheckoutStore } from '../stores/checkout.store'
import CheckoutCoupon from './CheckoutCoupon.vue'

const form = useCheckoutContext()
const { values, totals, coupon, locked } = form
const cart = useCartStore()
const checkout = useCheckoutStore()

interface SummaryLine {
  id: string
  name: string
  detail: string
  imageUrl: string | null
  quantity: number
  total: number
}

// Con la orden creada la bolsa queda vacia: las piezas salen de la orden (seccion 4.3)
const lines = computed<SummaryLine[]>(() => {
  if (checkout.order) {
    return checkout.order.items.map(item => ({
      id: item.id,
      name: item.productName,
      detail: [item.colorName, `Talla ${item.sizeName}`].filter(Boolean).join(' · '),
      imageUrl: item.imageUrl,
      quantity: item.quantity,
      total: item.subtotal,
    }))
  }
  return cart.lines.map(line => ({
    id: line.id,
    name: line.name,
    detail: [line.colorName, `Talla ${line.size}`].filter(Boolean).join(' · '),
    imageUrl: line.imageUrl,
    quantity: line.quantity,
    total: line.unitPrice * line.quantity,
  }))
})

const couponCode = computed(() => checkout.order?.couponCode ?? coupon.value?.code ?? null)

const shippingLabel = computed(() => {
  const shipping = totals.value.shipping
  const pickup = checkout.order ? checkout.order.pickup : values.mode === 'pickup'
  if (pickup) return 'Gratis'
  if (shipping === null) return form.shippingStatus.value === 'loading' ? 'Calculando…' : 'Elige un método'
  return shipping === 0 ? 'Gratis' : formatMoney(shipping)
})
</script>

<template>
  <div class="grid gap-6">
    <div class="flex items-baseline justify-between gap-3">
      <h2 class="text-lg font-semibold tracking-tight text-ink">
        Tu pedido
      </h2>
      <button
        v-if="!locked"
        type="button"
        class="text-[13px] font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-accent"
        @click="cart.open()"
      >
        Editar bolsa
      </button>
    </div>

    <ul class="grid gap-4">
      <li
        v-for="line in lines"
        :key="line.id"
        class="flex items-center gap-3.5"
      >
        <span class="relative shrink-0">
          <img
            v-if="line.imageUrl"
            :src="line.imageUrl"
            alt=""
            width="56"
            height="72"
            class="aspect-[7/9] w-14 rounded-lg border border-line object-cover"
          >
          <span
            v-else
            class="grid aspect-[7/9] w-14 place-items-center rounded-lg border border-line bg-surface text-ink-muted"
          >
            <Icon
              name="ph:image"
              class="size-4"
              aria-hidden="true"
            />
          </span>
          <span
            class="absolute -right-2 -top-2 grid min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-semibold leading-5 tabular-nums text-surface-raised"
            :aria-label="`${line.quantity} ${line.quantity === 1 ? 'pieza' : 'piezas'}`"
          >{{ line.quantity }}</span>
        </span>
        <span class="grid min-w-0 flex-1 gap-0.5">
          <span class="truncate text-sm font-medium text-ink">{{ line.name }}</span>
          <span class="truncate text-[13px] text-ink-muted">{{ line.detail }}</span>
        </span>
        <span class="shrink-0 text-sm font-medium tabular-nums text-ink">{{ formatMoney(line.total) }}</span>
      </li>
    </ul>

    <div
      v-if="!locked"
      class="border-t border-line pt-5"
    >
      <CheckoutCoupon />
    </div>

    <dl class="grid gap-2.5 border-t border-line pt-5 text-sm">
      <div class="flex justify-between gap-4">
        <dt class="text-ink-muted">
          Subtotal
        </dt>
        <dd class="tabular-nums text-ink">
          {{ formatMoney(totals.subtotal) }}
        </dd>
      </div>
      <div
        v-if="totals.discount > 0 || couponCode"
        class="flex justify-between gap-4"
      >
        <dt class="text-ink-muted">
          Descuento<template v-if="couponCode">
            <span class="ml-1.5 text-[12px] font-medium uppercase tracking-[0.04em]">{{ couponCode }}</span>
          </template>
        </dt>
        <dd class="tabular-nums text-success">
          {{ totals.discount > 0 ? `−${formatMoney(totals.discount)}` : 'Al confirmar' }}
        </dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-ink-muted">
          Envío
        </dt>
        <dd
          class="tabular-nums"
          :class="shippingLabel === 'Gratis' ? 'text-success' : 'text-ink'"
        >
          {{ shippingLabel }}
        </dd>
      </div>
      <div class="mt-2 flex items-baseline justify-between gap-4 border-t border-line pt-4">
        <dt class="font-medium text-ink">
          Total
        </dt>
        <dd class="text-2xl font-semibold tracking-tight tabular-nums text-ink">
          <span class="mr-1.5 text-[12px] font-medium tracking-normal text-ink-muted">MXN</span>{{ formatMoney(totals.total) }}
        </dd>
      </div>
      <p class="text-right text-[12px] tabular-nums text-ink-muted">
        Incluye {{ formatMoney(totals.tax) }} de IVA
      </p>
    </dl>
  </div>
</template>
