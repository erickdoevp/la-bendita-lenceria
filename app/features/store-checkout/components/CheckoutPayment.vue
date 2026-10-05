<script setup lang="ts">
import { TurnstileWidget } from '~/features/auth'
import { PAYMENT_METHODS } from '../constants'
import { useCheckoutContext } from '../composables/useCheckoutContext'
import type { CheckoutStep } from '../composables/useCheckoutForm'
import type { CheckoutPaymentMethod } from '../types'
import CheckoutOption from './CheckoutOption.vue'
import CheckoutPaymentElement from './CheckoutPaymentElement.vue'
import CheckoutSection from './CheckoutSection.vue'

const form = useCheckoutContext()
const { values, isGuest, locked, step, paymentError, turnstile, paymentMethods, totals } = form

const element = ref<InstanceType<typeof CheckoutPaymentElement> | null>(null)
const widget = ref<InstanceType<typeof TurnstileWidget> | null>(null)
const busy = computed(() => step.value !== 'idle')

const method = computed({
  get: () => values.paymentMethod as string,
  set: (value: string) => (values.paymentMethod = value as CheckoutPaymentMethod),
})

const STEP_LABELS: Record<Exclude<CheckoutStep, 'idle'>, string> = {
  validating: 'Revisando tus datos…',
  creating: 'Apartando tus piezas…',
  paying: 'Preparando el pago…',
  confirming: 'Confirmando con tu banco…',
}

const buttonLabel = computed(() => {
  if (step.value !== 'idle') return STEP_LABELS[step.value]
  return values.paymentMethod === 'CARD' ? `Pagar ${formatMoney(totals.value.total)}` : 'Confirmar pedido'
})

async function onSubmit() {
  await form.submit(element.value)
  // El token de Turnstile ya se uso: el widget pide uno nuevo
  if (turnstile.enabled && !turnstile.token.value) widget.value?.reset()
}

const paymentNote = computed(() => {
  if (values.paymentMethod === 'BANK_TRANSFER') return 'Al confirmar te mostramos la cuenta y la referencia. Preparamos tu pedido cuando se refleje el pago.'
  if (values.paymentMethod === 'CASH_ON_DELIVERY') {
    return values.mode === 'pickup' ? 'Pagas en efectivo al recoger en la sucursal.' : 'Pagas en efectivo al recibir tu pedido.'
  }
  return null
})
</script>

<template>
  <CheckoutSection
    id="checkout-payment"
    :step="3"
    title="Pago"
    description="Todos los pagos se procesan de forma segura y cifrada."
  >
    <fieldset
      v-if="paymentMethods.length > 1"
      class="grid gap-3"
      :disabled="busy"
    >
      <legend class="sr-only">
        Método de pago
      </legend>
      <CheckoutOption
        v-for="key in paymentMethods"
        :key="key"
        v-model="method"
        name="checkout-payment"
        :value="key"
      >
        <span class="flex items-center gap-2 font-medium text-ink">
          <Icon
            :name="PAYMENT_METHODS[key].icon"
            class="size-4 shrink-0 text-ink-muted"
            aria-hidden="true"
          />
          {{ PAYMENT_METHODS[key].label }}
        </span>
        <span class="text-[13px] text-ink-muted">{{ PAYMENT_METHODS[key].description }}</span>
      </CheckoutOption>
    </fieldset>

    <div
      v-if="values.paymentMethod === 'CARD'"
      class="rounded-xl border border-line bg-surface-raised p-5"
    >
      <CheckoutPaymentElement
        ref="element"
        :disabled="busy"
      />
    </div>
    <p
      v-else-if="paymentNote"
      class="flex items-start gap-2.5 rounded-xl bg-surface px-4 py-3.5 text-sm leading-relaxed text-ink"
    >
      <Icon
        name="ph:info-bold"
        class="mt-0.5 size-4 shrink-0 text-ink-muted"
        aria-hidden="true"
      />
      {{ paymentNote }}
    </p>

    <div
      v-if="paymentError"
      role="alert"
      data-checkout-error
      tabindex="-1"
      class="flex items-start gap-3 rounded-xl bg-danger-soft px-4 py-3 text-sm leading-relaxed text-danger"
    >
      <Icon
        name="ph:warning-circle-bold"
        class="mt-0.5 size-5 shrink-0"
        aria-hidden="true"
      />
      <div class="grid gap-0.5">
        <p class="font-medium">
          {{ paymentError }}
        </p>
        <p
          v-if="locked"
          class="text-danger/80"
        >
          Tus piezas siguen apartadas. Puedes intentar con otra tarjeta.
        </p>
      </div>
    </div>

    <TurnstileWidget
      v-if="isGuest && !locked && turnstile.enabled"
      ref="widget"
      :site-key="turnstile.siteKey"
      @verify="turnstile.token.value = $event"
      @expire="turnstile.token.value = null"
      @error="turnstile.token.value = null"
    />

    <div class="grid gap-3">
      <UiButton
        type="submit"
        class="h-12 w-full text-base"
        :loading="busy"
        :icon="busy ? undefined : 'ph:lock-simple-bold'"
        @click.prevent="onSubmit"
      >
        {{ buttonLabel }}
      </UiButton>
      <p class="text-center text-[12px] leading-relaxed text-ink-muted">
        Al pagar aceptas los
        <NuxtLink
          to="/legal/terminos"
          class="underline underline-offset-2 hover:text-ink"
        >términos y condiciones</NuxtLink>
        y el
        <NuxtLink
          to="/legal/privacidad"
          class="underline underline-offset-2 hover:text-ink"
        >aviso de privacidad</NuxtLink>.
      </p>
    </div>
  </CheckoutSection>
</template>
