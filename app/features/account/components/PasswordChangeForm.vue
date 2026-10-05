<script setup lang="ts">
import { CUSTOMER_AUTH_ROUTES, PasswordChecklist, PasswordInput, useCustomerAuthStore } from '~/features/customer-auth'
import { passwordChangeSchema } from '../schemas'
import { useProfileApi } from '../services'

const auth = useCustomerAuthStore()
const api = useProfileApi()
const { fieldErrors, formError, validate, applyApiError, clearField } = useFormErrors()

const values = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const pending = ref(false)

for (const key of Object.keys(values) as (keyof typeof values)[]) {
  watch(() => values[key], () => clearField(key))
}

async function onSubmit() {
  const payload = validate(passwordChangeSchema, values)
  if (!payload) return

  pending.value = true
  try {
    await api.changePassword({ currentPassword: payload.currentPassword, newPassword: payload.newPassword })
    // 204: el backend cerro todas las sesiones, incluida esta
    await auth.endSession()
    await navigateTo({ path: CUSTOMER_AUTH_ROUTES.login, query: { notice: 'password-changed' } }, { replace: true })
  }
  catch (error) {
    const info = applyApiError(error)
    // 400 "La contraseña actual es incorrecta." llega sin "errors"
    if (info.status === 400 && !Object.keys(info.fieldErrors).length && /actual/i.test(info.message)) {
      fieldErrors.value = { currentPassword: info.message }
      formError.value = null
      values.currentPassword = ''
    }
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <form
    class="grid max-w-md gap-5"
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
      label="Contraseña actual"
      :error="fieldErrors.currentPassword"
    >
      <PasswordInput
        v-model="values.currentPassword"
        autocomplete="current-password"
      />
    </UFormField>

    <UFormField
      label="Nueva contraseña"
      :error="fieldErrors.newPassword"
    >
      <PasswordInput
        v-model="values.newPassword"
        aria-describedby="password-new-rules"
        autocomplete="new-password"
      />
      <PasswordChecklist
        id="password-new-rules"
        class="mt-2"
        :password="values.newPassword"
      />
    </UFormField>

    <UFormField
      label="Repite la nueva contraseña"
      :error="fieldErrors.confirmPassword"
    >
      <PasswordInput
        v-model="values.confirmPassword"
        autocomplete="new-password"
      />
    </UFormField>

    <UAlert
      color="primary"
      icon="ph:info"
      title="Al cambiarla se cerrará tu sesión en todos tus dispositivos, también en este."
    />

    <UButton
      type="submit"
      class="justify-self-start"
      :loading="pending"
      label="Cambiar contraseña"
    />
  </form>
</template>
