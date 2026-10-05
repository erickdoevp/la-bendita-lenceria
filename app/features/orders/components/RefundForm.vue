<script setup lang="ts">
import { REFUND_REASON_LABELS } from '../constants'
import { refundSchema } from '../schemas'
import { useOrdersApi } from '../services'
import type { Order, Payment, RefundReason } from '../types'
import { refundableAmount } from '../utils/actions'

const props = defineProps<{
  order: Order
  payment: Payment
}>()
const emit = defineEmits<{ done: [message: string], cancel: [] }>()

const api = useOrdersApi()
const { fieldErrors, formError, validate, applyApiError, clearField } = useFormErrors()
const values = reactive({
  amount: '' as number | string,
  reason: 'requested_by_customer' as RefundReason,
  adminNotes: '',
})
const pending = ref(false)
const uid = useId()

const refundable = computed(() => refundableAmount(props.payment))
const amount = computed(() => (values.amount === '' ? refundable.value : toNumber(values.amount)))
const isTotal = computed(() => amount.value >= refundable.value)
const reasonOptions = Object.entries(REFUND_REASON_LABELS) as [RefundReason, string][]

watch(() => values.amount, () => clearField('amount'))
watch(() => values.adminNotes, () => clearField('adminNotes'))

async function onSubmit() {
  const payload = validate(refundSchema(refundable.value), values)
  if (!payload) return

  pending.value = true
  try {
    await api.refundPayment(props.payment.id, { amount: payload.amount, reason: payload.reason })
  }
  catch (error) {
    // Si responde error no se movio dinero: se puede reintentar sin riesgo
    applyApiError(error)
    pending.value = false
    return
  }

  const refunded = `Reembolso de ${formatMoney(payload.amount ?? refundable.value)} hecho.`
  if (!payload.adminNotes) {
    pending.value = false
    emit('done', refunded)
    return
  }

  // La nota va aparte con el estado que quedo (REFUNDED si fue total)
  try {
    const fresh = await api.get(props.order.id)
    await api.updateStatus(props.order.id, { status: fresh.status, adminNotes: payload.adminNotes })
    emit('done', refunded)
  }
  catch {
    emit('done', `${refunded} No se pudo guardar la nota interna; agrégala desde "Nota interna".`)
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <form
    class="grid gap-5"
    novalidate
    @submit.prevent="onSubmit"
  >
    <UiAlert v-if="formError">
      {{ formError }}
    </UiAlert>

    <p class="flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm">
      <span class="text-ink-muted">Disponible para reembolsar</span>
      <span class="font-semibold tabular-nums text-ink">{{ formatMoney(refundable) }}</span>
    </p>

    <div class="grid gap-5 sm:grid-cols-2">
      <UiField
        :id="`${uid}-amount`"
        v-slot="field"
        label="Monto"
        hint="Vacío = reembolso total."
        :error="fieldErrors.amount"
        optional
      >
        <UiInput
          :id="field.id"
          v-model="values.amount"
          type="number"
          inputmode="decimal"
          min="0.01"
          :max="refundable"
          step="0.01"
          prefix="$"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          :placeholder="refundable.toFixed(2)"
        />
      </UiField>

      <UiField
        :id="`${uid}-reason`"
        v-slot="field"
        label="Motivo"
        :error="fieldErrors.reason"
      >
        <UiSelect
          :id="field.id"
          v-model="values.reason"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
        >
          <option
            v-for="[value, label] in reasonOptions"
            :key="value"
            :value="value"
          >
            {{ label }}
          </option>
        </UiSelect>
      </UiField>
    </div>

    <UiField
      :id="`${uid}-notes`"
      v-slot="field"
      label="Nota interna"
      optional
      hint="Se guarda en la orden para saber por qué se reembolsó."
      :error="fieldErrors.adminNotes"
    >
      <UiInput
        :id="field.id"
        v-model="values.adminNotes"
        maxlength="500"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        placeholder="Talla equivocada, devolvió la prenda"
        autocomplete="off"
      />
    </UiField>

    <UiAlert tone="info">
      <template v-if="!isTotal">
        Reembolso parcial: la orden no cambia de estado y el stock no regresa.
        Si devolvió mercancía, registra la entrada en Inventario.
      </template>
      <template v-else-if="order.status === 'DELIVERED'">
        La orden pasará a Reembolsada, pero el stock <strong>no regresa</strong> porque la mercancía la tiene la clienta.
        Si la devuelve, registra la entrada en Inventario.
      </template>
      <template v-else>
        La orden pasará a Reembolsada y el stock regresa al inventario.
      </template>
      El dinero se devuelve en Stripe y no se puede deshacer.
    </UiAlert>

    <div class="flex flex-wrap justify-end gap-2">
      <UiButton
        variant="secondary"
        :disabled="pending"
        @click="emit('cancel')"
      >
        No reembolsar
      </UiButton>
      <UiButton
        type="submit"
        variant="danger"
        icon="ph:arrow-u-up-left"
        :loading="pending"
      >
        Reembolsar {{ formatMoney(Math.min(amount, refundable)) }}
      </UiButton>
    </div>
  </form>
</template>
