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
const uid = useId()

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
    <UiAlert v-if="formError">
      {{ formError }}
    </UiAlert>

    <div class="grid gap-5 sm:grid-cols-2">
      <UiField
        :id="`${uid}-stock`"
        v-slot="field"
        label="Stock contado"
        :hint="levels.reservedStock ? `Mínimo ${levels.reservedStock} (reservado en pedidos).` : 'Unidades físicas en almacén.'"
        :error="fieldErrors.stock"
      >
        <UiInput
          :id="field.id"
          v-model="values.stock"
          type="number"
          inputmode="numeric"
          :min="levels.reservedStock"
          step="1"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          autofocus
        />
      </UiField>

      <UiField
        :id="`${uid}-threshold`"
        v-slot="field"
        label="Umbral de alerta"
        hint="Avisa cuando lo disponible llega a este número."
        :error="fieldErrors.lowStockThreshold"
        optional
      >
        <UiInput
          :id="field.id"
          v-model="values.lowStockThreshold"
          type="number"
          inputmode="numeric"
          min="0"
          step="1"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
        />
      </UiField>
    </div>

    <UiField
      :id="`${uid}-reason`"
      v-slot="field"
      label="Motivo"
      hint="Queda en el kardex para auditoría."
      :error="fieldErrors.reason"
    >
      <UiInput
        :id="field.id"
        v-model="values.reason"
        maxlength="255"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        placeholder="Conteo mensual"
        autocomplete="off"
      />
    </UiField>

    <p
      class="flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm"
      aria-live="polite"
    >
      <span class="text-ink-muted">Diferencia contra el sistema ({{ levels.stock }})</span>
      <span
        class="font-semibold tabular-nums"
        :class="!difference ? 'text-ink-muted' : difference > 0 ? 'text-success' : 'text-danger'"
      >
        {{ difference === null ? '-' : difference > 0 ? `+${difference}` : difference }}
      </span>
    </p>

    <div class="flex flex-wrap justify-end gap-2">
      <UiButton
        variant="secondary"
        :disabled="pending"
        @click="emit('cancel')"
      >
        Cancelar
      </UiButton>
      <UiButton
        type="submit"
        :loading="pending"
        icon="ph:clipboard-text"
      >
        Guardar conteo
      </UiButton>
    </div>
  </form>
</template>
