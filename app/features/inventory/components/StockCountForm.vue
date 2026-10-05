<script setup lang="ts">
import { stockCountSchema } from '../schemas'
import { useInventoryApi } from '../services'
import type { Inventory, StockLevels } from '../types'

const props = defineProps<{
  variantId: string
  levels: StockLevels
}>()
const emit = defineEmits<{ saved: [inventory: Inventory], cancel: [] }>()

const api = useInventoryApi()
const { fieldErrors, formError, validate, applyApiError, clearField } = useFormErrors()
const values = reactive({
  stock: props.levels.stock as number | string,
  lowStockThreshold: props.levels.lowStockThreshold as number | string,
  reason: '',
})
const pending = ref(false)

// Los niveles se refrescan al abrir el modal: si cambia lo reservado, el formulario lo refleja
watch(() => props.levels.stock, (stock, previous) => {
  if (toNumber(values.stock) === previous) values.stock = stock
})

const difference = computed(() =>
  values.stock === '' ? null : Math.trunc(toNumber(values.stock)) - props.levels.stock,
)

watch(() => values.stock, () => clearField('stock'))
watch(() => values.lowStockThreshold, () => clearField('lowStockThreshold'))
watch(() => values.reason, () => clearField('reason'))

async function onSubmit() {
  const payload = validate(stockCountSchema(props.levels.reservedStock), values)
  if (!payload) return

  pending.value = true
  try {
    emit('saved', await api.setStock(props.variantId, payload))
  }
  catch (error) {
    applyApiError(error)
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

    <div class="grid gap-5 sm:grid-cols-2">
      <UFormField
        label="Stock contado"
        :help="levels.reservedStock ? `Mínimo ${levels.reservedStock} (reservado en pedidos).` : 'Unidades físicas en almacén.'"
        :error="fieldErrors.stock"
      >
        <UInput
          v-model.number="values.stock"
          type="number"
          inputmode="numeric"
          :min="levels.reservedStock"
          step="1"
          autofocus
        />
      </UFormField>

      <UFormField
        label="Umbral de alerta"
        help="Avisa cuando lo disponible llega a este número."
        :error="fieldErrors.lowStockThreshold"
        hint="Opcional"
      >
        <UInput
          v-model.number="values.lowStockThreshold"
          type="number"
          inputmode="numeric"
          min="0"
          step="1"
        />
      </UFormField>
    </div>

    <UFormField
      label="Motivo"
      help="Queda en el kardex para auditoría."
      :error="fieldErrors.reason"
    >
      <UInput
        v-model="values.reason"
        maxlength="255"
        placeholder="Conteo mensual"
        autocomplete="off"
      />
    </UFormField>

    <p
      class="flex items-center justify-between rounded-lg bg-muted px-4 py-3 text-sm"
      aria-live="polite"
    >
      <span class="text-muted">Diferencia contra el sistema ({{ levels.stock }})</span>
      <span
        class="font-semibold tabular-nums"
        :class="!difference ? 'text-muted' : difference > 0 ? 'text-success' : 'text-error'"
      >
        {{ difference === null ? '-' : difference > 0 ? `+${difference}` : difference }}
      </span>
    </p>

    <div class="flex flex-wrap justify-end gap-2">
      <UButton
        color="neutral"
        variant="outline"
        :disabled="pending"
        label="Cancelar"
        @click="emit('cancel')"
      />
      <UButton
        type="submit"
        :loading="pending"
        icon="ph:clipboard-text"
        label="Guardar conteo"
      />
    </div>
  </form>
</template>
