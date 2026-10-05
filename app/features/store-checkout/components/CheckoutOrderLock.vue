<script setup lang="ts">
import { useCheckoutContext } from '../composables/useCheckoutContext'
import { usePaymentCountdown } from '../composables/usePaymentCountdown'
import { useCheckoutStore } from '../stores/checkout.store'

const form = useCheckoutContext()
const checkout = useCheckoutStore()
const confirming = ref(false)

const order = computed(() => checkout.order!)
const countdown = usePaymentCountdown(() => checkout.expiresAt, () => form.onExpired())

const address = computed(() => {
  const a = order.value.shippingAddress
  if (!a) return null
  return {
    who: `${a.recipientName} · ${a.phone}`,
    line: `${a.street} ${a.exteriorNumber}${a.interiorNumber ? ` int. ${a.interiorNumber}` : ''}, ${a.colonia}`,
    city: `${a.cp} ${a.municipio}, ${a.estado}`,
  }
})

async function onEdit() {
  confirming.value = false
  await form.editOrder()
}
</script>

<template>
  <!-- La orden ya existe y tiene stock apartado: entrega y contacto quedan fijos -->
  <section
    aria-labelledby="checkout-lock-title"
    class="grid gap-6 pb-10"
  >
    <div class="grid gap-4 rounded-xl border border-line bg-surface-raised p-5 sm:p-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="grid gap-1">
          <p class="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-muted">
            Pedido {{ order.orderNumber }}
          </p>
          <h2
            id="checkout-lock-title"
            class="text-xl font-semibold tracking-tight text-ink"
          >
            Tus piezas están apartadas
          </h2>
        </div>
        <p
          v-if="countdown.label.value"
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium tabular-nums"
          :class="countdown.urgent.value ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning'"
          role="timer"
          :aria-label="`Tiempo restante para pagar: ${countdown.label.value}`"
        >
          <Icon
            name="ph:timer-bold"
            class="size-4"
            aria-hidden="true"
          />
          {{ countdown.label.value }}
        </p>
      </div>
      <p
        v-if="countdown.label.value"
        class="text-sm leading-relaxed text-ink-muted"
      >
        Completa el pago antes de que termine el tiempo. Si no, liberamos las piezas y regresan a tu bolsa.
      </p>

      <dl class="grid gap-4 border-t border-line pt-4 text-sm sm:grid-cols-2">
        <div class="grid content-start gap-1">
          <dt class="text-ink-muted">
            {{ order.pickup ? 'Recoges en' : `Envío ${order.shippingConfigName?.toLowerCase() ?? ''}` }}
          </dt>
          <dd
            v-if="order.pickup"
            class="text-ink"
          >
            {{ order.pickupLocationName }}
          </dd>
          <dd
            v-else-if="address"
            class="grid text-ink"
          >
            <span>{{ address.who }}</span>
            <span>{{ address.line }}</span>
            <span>{{ address.city }}</span>
          </dd>
        </div>
        <div
          v-if="order.guestEmail || order.notes"
          class="grid content-start gap-3"
        >
          <div
            v-if="order.guestEmail"
            class="grid gap-1"
          >
            <dt class="text-ink-muted">
              Contacto
            </dt>
            <dd class="grid text-ink">
              <span>{{ order.guestName }}</span>
              <span class="break-all">{{ order.guestEmail }}</span>
            </dd>
          </div>
          <div
            v-if="order.notes"
            class="grid gap-1"
          >
            <dt class="text-ink-muted">
              Indicaciones
            </dt>
            <dd class="text-ink">
              {{ order.notes }}
            </dd>
          </div>
        </div>
      </dl>

      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4">
        <template v-if="confirming">
          <p class="text-sm text-ink">
            Se cancela este pedido y tus piezas regresan a la bolsa. ¿Continuar?
          </p>
          <div class="flex gap-2">
            <UiButton
              variant="secondary"
              size="sm"
              :loading="form.editing.value"
              @click="onEdit"
            >
              Sí, editar
            </UiButton>
            <UiButton
              variant="ghost"
              size="sm"
              :disabled="form.editing.value"
              @click="confirming = false"
            >
              No
            </UiButton>
          </div>
        </template>
        <button
          v-else
          type="button"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
          :disabled="form.step.value !== 'idle'"
          @click="confirming = true"
        >
          <Icon
            name="ph:pencil-simple-bold"
            class="size-3.5"
            aria-hidden="true"
          />
          Cambiar entrega o cupón
        </button>
      </div>
    </div>
  </section>
</template>
