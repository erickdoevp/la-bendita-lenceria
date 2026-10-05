<script setup lang="ts">
import { useLoginForm } from '../composables/useLoginForm'
import TurnstileWidget from './TurnstileWidget.vue'

const emit = defineEmits<{ success: [] }>()

const {
  values,
  fieldErrors,
  formError,
  pending,
  turnstileEnabled,
  turnstileSiteKey,
  turnstileToken,
  clearFieldError,
  submit,
} = useLoginForm()

const showPassword = ref(false)
const turnstile = ref<InstanceType<typeof TurnstileWidget> | null>(null)

watch(() => values.usernameOrEmail, () => clearFieldError('usernameOrEmail'))
watch(() => values.password, () => clearFieldError('password'))

async function onSubmit() {
  if (await submit()) {
    emit('success')
    return
  }
  if (turnstileEnabled && !turnstileToken.value) turnstile.value?.reset()
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
      label="Usuario o correo"
      :error="fieldErrors.usernameOrEmail"
    >
      <UInput
        v-model="values.usernameOrEmail"
        size="lg"
        autocomplete="username"
        :disabled="pending"
      />
    </UFormField>

    <UFormField
      label="Contraseña"
      :error="fieldErrors.password"
    >
      <UInput
        v-model="values.password"
        size="lg"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="current-password"
        :disabled="pending"
        :ui="{ trailing: 'pe-1' }"
      >
        <template #trailing>
          <UButton
            color="neutral"
            variant="link"
            :icon="showPassword ? 'ph:eye-slash' : 'ph:eye'"
            :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          />
        </template>
      </UInput>
    </UFormField>

    <TurnstileWidget
      v-if="turnstileEnabled"
      ref="turnstile"
      :site-key="turnstileSiteKey"
      @verify="turnstileToken = $event"
      @expire="turnstileToken = null"
      @error="turnstileToken = null"
    />

    <UButton
      type="submit"
      size="lg"
      block
      class="mt-1"
      :loading="pending"
      :label="pending ? 'Entrando' : 'Iniciar sesión'"
    />
  </form>
</template>
