<script setup lang="ts">
import { adminNotesSchema, cancelSchema } from '../schemas'
import { useOrdersApi } from '../services'
import type { Order, OrderStatus } from '../types'

const props = defineProps<{
  order: Order
  mode: 'process' | 'cancel' | 'notes'
  /** La orden ya se cobro: cancelar no devuelve el dinero. */
  paid?: boolean
}>()
const emit = defineEmits<{ done: [message: string], cancel: [] }>()

const api = useOrdersApi()
const { fieldErrors, formError, validate, applyApiError, clearField } = useFormErrors()
const values = reactive({ adminNotes: props.mode === 'notes' ? (props.order.adminNotes ?? '') : '' })
const pending = ref(false)
const uid = useId()

const copy = computed(() => ({
  process: { label: 'Pasar a preparación', icon: 'ph:package', variant: 'primary' as const, field: 'Nota interna', placeholder: 'Empacado por Luis' },
  cancel: { label: 'Cancelar orden', icon: 'ph:x-circle', variant: 'danger' as const, field: 'Motivo', placeholder: 'La clienta pidió cancelar por WhatsApp' },
  notes: { label: 'Guardar nota', icon: 'ph:floppy-disk', variant: 'primary' as const, field: 'Nota interna', placeholder: 'Solo la ve el equipo' },
})[props.mode])

const nextStatus = computed<OrderStatus>(() => {
  if (props.mode === 'process') return 'PROCESSING'
  if (props.mode === 'cancel') return 'CANCELLED'
  // Mismo estado: el backend lo acepta siempre y solo reemplaza la nota
  return props.order.status
})

watch(() => values.adminNotes, () => clearField('adminNotes'))

async function onSubmit() {
  const payload = validate(props.mode === 'cancel' ? cancelSchema : adminNotesSchema, values)
  if (!payload) return

  pending.value = true
  try {
    await api.updateStatus(props.order.id, {
      status: nextStatus.value,
      // En "notes" se manda aunque este vacia: asi se puede borrar la nota
      adminNotes: props.mode === 'notes' ? (payload.adminNotes ?? '') : payload.adminNotes,
    })
    emit('done', props.mode === 'process' ? 'La orden pasó a preparación.' : props.mode === 'cancel' ? 'Orden cancelada.' : 'Nota guardada.')
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

    <UiAlert v-if="mode === 'cancel' && paid">
      Esta orden ya se cobró. Cancelar devuelve el stock pero <strong>no devuelve el dinero</strong>.
      Si hay que regresarlo, usa <strong>Reembolsar</strong>. Cancela solo si el dinero ya se devolvió por fuera.
    </UiAlert>
    <UiAlert
      v-else-if="mode === 'cancel'"
      tone="info"
    >
      Se libera el stock apartado y, si usó cupón, se le devuelve a la clienta. No se puede deshacer.
    </UiAlert>

    <UiField
      :id="`${uid}-notes`"
      v-slot="field"
      :label="copy.field"
      :optional="mode !== 'cancel'"
      :hint="mode === 'process' && order.adminNotes ? 'Si escribes algo, reemplaza la nota interna actual.' : undefined"
      :error="fieldErrors.adminNotes"
    >
      <UiTextarea
        :id="field.id"
        v-model="values.adminNotes"
        class="min-h-24"
        maxlength="500"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        :placeholder="copy.placeholder"
        autofocus
      />
    </UiField>

    <div class="flex flex-wrap justify-end gap-2">
      <UiButton
        variant="secondary"
        :disabled="pending"
        @click="emit('cancel')"
      >
        {{ mode === 'cancel' ? 'No cancelar' : 'Cancelar' }}
      </UiButton>
      <UiButton
        type="submit"
        :variant="copy.variant"
        :icon="copy.icon"
        :loading="pending"
      >
        {{ copy.label }}
      </UiButton>
    </div>
  </form>
</template>
