<script setup lang="ts">
import { TurnstileWidget } from '~/features/auth'
import { useCustomerLoginForm } from '../composables/useCustomerLoginForm'
import PasswordInput from './PasswordInput.vue'

const emit = defineEmits<{ success: [] }>()

const { values, fieldErrors, formError, pending, turnstile, clearField, submit } = useCustomerLoginForm()
const widget = ref<InstanceType<typeof TurnstileWidget> | null>(null)

watch(() => values.usernameOrEmail, () => clearField('usernameOrEmail'))
watch(() => values.password, () => clearField('password'))

async function onSubmit() {
  if (await submit()) {
    emit('success')
    return
  }
  if (turnstile.enabled && !turnstile.token.value) widget.value?.reset()
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
      id="login-user"
      v-slot="field"
      label="Usuario o correo"
      :error="fieldErrors.usernameOrEmail"
    >
      <UiInput
        :id="field.id"
        v-model="values.usernameOrEmail"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        :disabled="pending"
        autocomplete="username"
        autocapitalize="none"
        spellcheck="false"
      />
    </UiField>

    <UiField
      id="login-password"
      v-slot="field"
      label="Contraseña"
      :error="fieldErrors.password"
    >
      <PasswordInput
        :id="field.id"
        v-model="values.password"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        :disabled="pending"
        autocomplete="current-password"
      />
    </UiField>

    <TurnstileWidget
      v-if="turnstile.enabled"
      ref="widget"
      :site-key="turnstile.siteKey"
      @verify="turnstile.token.value = $event"
      @expire="turnstile.token.value = null"
      @error="turnstile.token.value = null"
    />

    <UiButton
      type="submit"
      class="mt-1"
      :loading="pending"
    >
      {{ pending ? 'Entrando' : 'Iniciar sesión' }}
    </UiButton>
  </form>
</template>
