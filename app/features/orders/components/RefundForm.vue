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

const refundable = computed(() => refundableAmount(props.payment))
const amount = computed(() => (values.amount === '' ? refundable.value : toNumber(values.amount)))
const isTotal = computed(() => amount.value >= refundable.value)
const reasonItems = (Object.entries(REFUND_REASON_LABELS) as [RefundReason, string][]).map(([value, label]) => ({ label, value }))

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
    <UAlert
      v-if="formError"
      color="error"
      icon="ph:warning-circle"
      :title="formError"
    />

    <p class="flex items-center justify-between rounded-lg bg-muted px-4 py-3 text-sm">
      <span class="text-muted">Disponible para reembolsar</span>
      <span class="font-semibold tabular-nums text-highlighted">{{ formatMoney(refundable) }}</span>
    </p>

    <div class="grid gap-5 sm:grid-cols-2">
      <UFormField
        label="Monto"
        help="Vacío = reembolso total."
        :error="fieldErrors.amount"
        hint="Opcional"
      >
        <UInput
          v-model.number="values.amount"
          type="number"
          inputmode="decimal"
          min="0.01"
          :max="refundable"
          step="0.01"
          :placeholder="refundable.toFixed(2)"
        >
          <template #leading>
            <span class="text-muted">$</span>
          </template>
        </UInput>
      </UFormField>

      <UFormField
        label="Motivo"
        :error="fieldErrors.reason"
      >
        <USelect
          v-model="values.reason"
          :items="reasonItems"
        />
      </UFormField>
    </div>

    <UFormField
      label="Nota interna"
      help="Se guarda en la orden para saber por qué se reembolsó."
      :error="fieldErrors.adminNotes"
      hint="Opcional"
    >
      <UInput
        v-model="values.adminNotes"
        maxlength="500"
        placeholder="Talla equivocada, devolvió la prenda"
        autocomplete="off"
      />
    </UFormField>

    <UAlert
      color="primary"
      icon="ph:info"
    >
      <template #title>
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
    
      </template>
    </UAlert>

    <div class="flex flex-wrap justify-end gap-2">
      <UButton
        color="neutral"
        variant="outline"
        :disabled="pending"
        label="No reembolsar"
        @click="emit('cancel')"
      />
      <UButton
        color="error"
        variant="soft"
        type="submit"
        icon="ph:arrow-u-up-left"
        :loading="pending"
      >
        Reembolsar {{ formatMoney(Math.min(amount, refundable)) }}
      </UButton>
    </div>
  </form>
</template>
