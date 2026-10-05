<script setup lang="ts">
import { USE_CHECKOUT_MOCKS } from '../constants'
import type { PaymentGateway } from '../utils/payment-gateway'
import CheckoutTestCardForm from './CheckoutTestCardForm.vue'

defineProps<{ disabled?: boolean }>()

const testForm = ref<InstanceType<typeof CheckoutTestCardForm> | null>(null)

/**
 * TODO(stripe): con USE_CHECKOUT_MOCKS = false, montar aqui el Payment Element
 * (ver utils/payment-gateway.ts) y que este gateway delegue en Stripe.js.
 */
const NOT_READY = 'Los pagos con tarjeta todavía no están disponibles.'

const gateway: PaymentGateway = {
  validate: () => testForm.value?.validate() ?? Promise.resolve(NOT_READY),
  confirm: (clientSecret, returnUrl) => testForm.value?.confirm(clientSecret, returnUrl) ?? Promise.resolve(NOT_READY),
}

defineExpose(gateway)
</script>

<template>
  <CheckoutTestCardForm
    v-if="USE_CHECKOUT_MOCKS"
    ref="testForm"
    :disabled="disabled"
  />
  <UiAlert v-else>
    {{ NOT_READY }}
  </UiAlert>
</template>
