<script setup lang="ts">
// Solo para USE_CHECKOUT_MOCKS. Con Stripe los datos de la tarjeta viven en el iframe
// del Payment Element y nunca pasan por la tienda.
import { checkoutMock, MOCK_TEST_CARDS } from '../mocks/checkout.mock'
import { formatCardNumber, formatExpiry, isValidCardNumber } from '../utils/checkout-totals'
import type { PaymentGateway } from '../utils/payment-gateway'

const props = defineProps<{ disabled?: boolean }>()

const uid = useId()
const card = reactive({ number: '', expiry: '', cvc: '' })
const errors = reactive<{ number?: string, expiry?: string, cvc?: string }>({})

watch(() => card.number, (value) => {
  const formatted = formatCardNumber(value)
  if (formatted !== value) card.number = formatted
  errors.number = undefined
})
watch(() => card.expiry, (value) => {
  const formatted = formatExpiry(value)
  if (formatted !== value) card.expiry = formatted
  errors.expiry = undefined
})
watch(() => card.cvc, (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits !== value) card.cvc = digits
  errors.cvc = undefined
})

function fillTestCard(number: string) {
  card.number = number
  card.expiry = '12 / 30'
  card.cvc = '123'
}

function expiryError() {
  const [month, year] = card.expiry.split('/').map(part => Number(part.trim()))
  if (!month || !year || month > 12) return 'Escribe el vencimiento como MM / AA.'
  const end = new Date(2000 + year, month, 1)
  return end <= new Date() ? 'Esta tarjeta ya venció.' : undefined
}

const gateway: PaymentGateway = {
  async validate() {
    errors.number = isValidCardNumber(card.number) ? undefined : 'Revisa el número de tu tarjeta.'
    errors.expiry = expiryError()
    errors.cvc = /^\d{3,4}$/.test(card.cvc) ? undefined : 'Escribe los 3 o 4 dígitos del reverso.'
    return errors.number || errors.expiry || errors.cvc ? 'Revisa los datos de tu tarjeta.' : null
  },
  async confirm(clientSecret) {
    // Lo que tardaria Stripe en hablar con el banco
    await new Promise(resolve => setTimeout(resolve, 900))
    return checkoutMock.confirmCard(clientSecret, card.number.replace(/\D/g, '')).error
  },
}

defineExpose(gateway)

const brand = computed(() => {
  const digits = card.number.replace(/\D/g, '')
  if (/^4/.test(digits)) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard'
  if (/^3[47]/.test(digits)) return 'Amex'
  return null
})
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span class="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-warning">
        <Icon
          name="ph:flask-bold"
          class="size-3"
          aria-hidden="true"
        />
        Modo de prueba
      </span>
      <span class="text-[12px] text-ink-muted">No se hace ningún cargo real.</span>
    </div>

    <fieldset
      class="grid gap-4"
      :disabled="props.disabled"
    >
      <legend class="sr-only">
        Datos de la tarjeta
      </legend>
      <UiField
        :id="`${uid}-number`"
        v-slot="field"
        label="Número de tarjeta"
        :error="errors.number"
      >
        <div class="relative">
          <UiInput
            :id="field.id"
            v-model="card.number"
            :invalid="field.invalid"
            :aria-describedby="field.describedBy"
            inputmode="numeric"
            autocomplete="cc-number"
            placeholder="1234 1234 1234 1234"
            class="pr-24 tabular-nums"
          />
          <span class="pointer-events-none absolute inset-y-0 right-3.5 flex items-center gap-1.5 text-[12px] font-medium text-ink-muted">
            {{ brand }}
            <Icon
              name="ph:credit-card-bold"
              class="size-4"
              aria-hidden="true"
            />
          </span>
        </div>
      </UiField>
      <div class="grid grid-cols-2 gap-4">
        <UiField
          :id="`${uid}-expiry`"
          v-slot="field"
          label="Vencimiento"
          :error="errors.expiry"
        >
          <UiInput
            :id="field.id"
            v-model="card.expiry"
            :invalid="field.invalid"
            :aria-describedby="field.describedBy"
            inputmode="numeric"
            autocomplete="cc-exp"
            placeholder="MM / AA"
            class="tabular-nums"
          />
        </UiField>
        <UiField
          :id="`${uid}-cvc`"
          v-slot="field"
          label="Código de seguridad"
          :error="errors.cvc"
        >
          <UiInput
            :id="field.id"
            v-model="card.cvc"
            :invalid="field.invalid"
            :aria-describedby="field.describedBy"
            inputmode="numeric"
            autocomplete="cc-csc"
            placeholder="CVC"
            class="tabular-nums"
          />
        </UiField>
      </div>
    </fieldset>

    <details class="group rounded-lg bg-surface px-4 py-3 text-sm">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-2 font-medium text-ink focus-visible:outline-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
        Tarjetas de prueba
        <Icon
          name="ph:plus-bold"
          class="size-3.5 text-ink-muted transition-transform duration-200 group-open:rotate-45"
          aria-hidden="true"
        />
      </summary>
      <ul class="mt-3 grid gap-1">
        <li
          v-for="test in MOCK_TEST_CARDS"
          :key="test.number"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-accent"
            @click="fillTestCard(test.number)"
          >
            <kbd class="rounded border border-line bg-surface-raised px-1.5 py-0.5 font-mono text-[12px] tabular-nums text-ink">{{ test.number }}</kbd>
            <span class="text-[13px] text-ink-muted">{{ test.result }}</span>
          </button>
        </li>
      </ul>
      <p class="mt-2 px-2 text-[12px] text-ink-muted">
        Cualquier fecha futura y cualquier CVC.
      </p>
    </details>
  </div>
</template>
