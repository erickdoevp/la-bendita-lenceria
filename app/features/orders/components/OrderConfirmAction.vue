<script setup lang="ts">
/** Confirmacion de una accion sin campos (sin body): ejecuta `run` y avisa al terminar. */
const props = withDefaults(defineProps<{
  message: string
  confirmLabel: string
  doneMessage: string
  run: () => Promise<unknown>
  icon?: string
  variant?: 'primary' | 'danger'
}>(), { icon: undefined, variant: 'primary' })
const emit = defineEmits<{ done: [message: string], cancel: [] }>()

const { formError, applyApiError } = useFormErrors()
const pending = ref(false)

async function onConfirm() {
  pending.value = true
  try {
    await props.run()
    emit('done', props.doneMessage)
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
  <div class="grid gap-5">
    <UiAlert v-if="formError">
      {{ formError }}
    </UiAlert>

    <p class="text-sm leading-relaxed text-ink">
      {{ message }}
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
        :variant="variant"
        :icon="icon"
        :loading="pending"
        @click="onConfirm"
      >
        {{ confirmLabel }}
      </UiButton>
    </div>
  </div>
</template>
