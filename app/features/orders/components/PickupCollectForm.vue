<script setup lang="ts">
import { useOrdersApi } from '../services'
import type { Order } from '../types'

const props = defineProps<{ order: Order }>()
const emit = defineEmits<{ done: [message: string], cancel: [] }>()

const api = useOrdersApi()
const { formError, applyApiError } = useFormErrors()
const code = ref('')
const pending = ref(false)
const uid = useId()

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
    <UiAlert v-if="formError">
      {{ formError }}
    </UiAlert>

    <UiField
      v-if="expected"
      :id="`${uid}-code`"
      v-slot="field"
      label="Código que presenta la clienta"
      :hint="`Debe coincidir con el de la orden (${expected.length} caracteres).`"
      :error="mismatch ? 'El código no coincide con el de esta orden.' : undefined"
    >
      <UiInput
        :id="field.id"
        v-model="code"
        class="font-mono uppercase tracking-[0.2em]"
        :maxlength="expected.length"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        autocomplete="off"
        spellcheck="false"
        autofocus
      />
    </UiField>
    <UiAlert
      v-else
      tone="info"
    >
      Esta orden no tiene código de recogida. Verifica la identidad de la clienta antes de entregar.
    </UiAlert>

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
        icon="ph:hand-arrow-down"
        :loading="pending"
        :disabled="!matches"
      >
        Marcar entregada
      </UiButton>
    </div>
  </form>
</template>
