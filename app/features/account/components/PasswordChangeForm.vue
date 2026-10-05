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
    <UiAlert v-if="formError">
      {{ formError }}
    </UiAlert>

    <UiField
      id="password-current"
      v-slot="field"
      label="Contraseña actual"
      :error="fieldErrors.currentPassword"
    >
      <PasswordInput
        :id="field.id"
        v-model="values.currentPassword"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        autocomplete="current-password"
      />
    </UiField>

    <UiField
      id="password-new"
      v-slot="field"
      label="Nueva contraseña"
      :error="fieldErrors.newPassword"
    >
      <PasswordInput
        :id="field.id"
        v-model="values.newPassword"
        :invalid="field.invalid"
        :aria-describedby="[field.describedBy, 'password-new-rules'].filter(Boolean).join(' ')"
        autocomplete="new-password"
      />
      <PasswordChecklist
        id="password-new-rules"
        :password="values.newPassword"
      />
    </UiField>

    <UiField
      id="password-confirm"
      v-slot="field"
      label="Repite la nueva contraseña"
      :error="fieldErrors.confirmPassword"
    >
      <PasswordInput
        :id="field.id"
        v-model="values.confirmPassword"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        autocomplete="new-password"
      />
    </UiField>

    <UiAlert tone="info">
      Al cambiarla se cerrará tu sesión en todos tus dispositivos, también en este.
    </UiAlert>

    <UiButton
      type="submit"
      class="justify-self-start"
      :loading="pending"
    >
      Cambiar contraseña
    </UiButton>
  </form>
</template>
