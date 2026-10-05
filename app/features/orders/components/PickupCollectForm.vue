<script setup lang="ts">
import { useOrdersApi } from '../services'
import type { Order } from '../types'

const props = defineProps<{ order: Order }>()
const emit = defineEmits<{ done: [message: string], cancel: [] }>()

const api = useOrdersApi()
const { formError, applyApiError } = useFormErrors()
const code = ref('')
const pending = ref(false)

// El backend no verifica el codigo: la comparacion se hace aqui
const expected = computed(() => props.order.pickupCode?.toUpperCase() ?? null)
const typed = computed(() => code.value.trim().toUpperCase())
const matches = computed(() => !expected.value || typed.value === expected.value)
const mismatch = computed(() => Boolean(expected.value && typed.value.length >= expected.value.length && !matches.value))

async function onSubmit() {
  if (!matches.value) return
  pending.value = true
  try {
    await api.markCollected(props.order.id)
    emit('done', 'Orden entregada en tienda.')
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

    <UFormField
      v-if="expected"
      label="Código que presenta la clienta"
      :help="`Debe coincidir con el de la orden (${expected.length} caracteres).`"
      :error="mismatch ? 'El código no coincide con el de esta orden.' : undefined"
    >
      <UInput
        v-model="code"
        class="font-mono uppercase tracking-[0.2em]"
        :maxlength="expected.length"
        autocomplete="off"
        spellcheck="false"
        autofocus
      />
    </UFormField>
    <UAlert
      v-else
      color="primary"
      icon="ph:info"
      title="Esta orden no tiene código de recogida. Verifica la identidad de la clienta antes de entregar."
    />

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
        icon="ph:hand-arrow-down"
        :loading="pending"
        :disabled="!matches"
        label="Marcar entregada"
      />
    </div>
  </form>
</template>
