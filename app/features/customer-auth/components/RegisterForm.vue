<script setup lang="ts">
import { TurnstileWidget } from '~/features/auth'
import { useRegisterForm } from '../composables/useRegisterForm'
import PasswordChecklist from './PasswordChecklist.vue'
import PasswordInput from './PasswordInput.vue'

const emit = defineEmits<{ success: [] }>()

const { values, fieldErrors, formError, pending, turnstile, clearField, submit } = useRegisterForm()
const widget = ref<InstanceType<typeof TurnstileWidget> | null>(null)

for (const key of Object.keys(values) as (keyof typeof values)[]) {
  watch(() => values[key], () => clearField(key))
}

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
    <UAlert
      v-if="formError"
      color="error"
      icon="ph:warning-circle"
      :title="formError"
    />

    <UFormField
      label="Nombre"
      :error="fieldErrors.name"
    >
      <UInput
        v-model="values.name"
        autocomplete="given-name"
      />
    </UFormField>

    <div class="grid gap-5 sm:grid-cols-2 sm:gap-4">
      <UFormField
        label="Primer apellido"
        :error="fieldErrors.firstLastName"
      >
        <UInput
          v-model="values.firstLastName"
          autocomplete="family-name"
        />
      </UFormField>
      <UFormField
        label="Segundo apellido"
        :error="fieldErrors.secondLastName"
        hint="Opcional"
      >
        <UInput
          v-model="values.secondLastName"
        />
      </UFormField>
    </div>

    <UFormField
      label="Correo"
      :error="fieldErrors.email"
    >
      <UInput
        v-model="values.email"
        type="email"
        autocomplete="email"
        autocapitalize="none"
        spellcheck="false"
      />
    </UFormField>

    <UFormField
      label="Teléfono"
      :error="fieldErrors.phoneNumber"
      hint="Opcional"
    >
      <UInput
        v-model="values.phoneNumber"
        type="tel"
        inputmode="tel"
        autocomplete="tel-national"
      />
    </UFormField>

    <UFormField
      label="Nombre de usuario"
      help="De 4 a 20 caracteres. Aparece en tus reseñas y no se puede cambiar."
      :error="fieldErrors.username"
    >
      <UInput
        v-model="values.username"
        autocomplete="username"
        autocapitalize="none"
        spellcheck="false"
        maxlength="20"
      />
    </UFormField>

    <UFormField
      label="Contraseña"
      :error="fieldErrors.password"
    >
      <PasswordInput
        v-model="values.password"
        aria-describedby="register-password-rules"
        autocomplete="new-password"
      />
      <PasswordChecklist
        id="register-password-rules"
        class="mt-2"
        :password="values.password"
      />
    </UFormField>

    <UFormField :error="fieldErrors.acceptedPrivacyPolicy">
      <UCheckbox
        v-model="values.acceptedPrivacyPolicy"
        :ui="{ label: 'font-normal leading-relaxed' }"
      >
        <template #label>
          He leído y acepto el
          <!-- TODO: enlazar a la pagina del Aviso de Privacidad cuando exista -->
          <NuxtLink
            to="/aviso-de-privacidad"
            target="_blank"
            class="font-medium text-primary underline-offset-2 hover:underline"
          >Aviso de Privacidad</NuxtLink>.
        </template>
      </UCheckbox>
    </UFormField>

    <TurnstileWidget
      v-if="turnstile.enabled"
      ref="widget"
      :site-key="turnstile.siteKey"
      @verify="turnstile.token.value = $event"
      @expire="turnstile.token.value = null"
      @error="turnstile.token.value = null"
    />

    <UButton
      type="submit"
      class="mt-1"
      :loading="pending"
      :label="pending ? 'Creando tu cuenta' : 'Crear cuenta'"
    />
  </form>
</template>
