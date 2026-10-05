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
    <UiAlert v-if="formError">
      {{ formError }}
    </UiAlert>

    <UiField
      id="register-name"
      v-slot="field"
      label="Nombre"
      :error="fieldErrors.name"
    >
      <UiInput
        :id="field.id"
        v-model="values.name"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        autocomplete="given-name"
      />
    </UiField>

    <div class="grid gap-5 sm:grid-cols-2 sm:gap-4">
      <UiField
        id="register-last-name"
        v-slot="field"
        label="Primer apellido"
        :error="fieldErrors.firstLastName"
      >
        <UiInput
          :id="field.id"
          v-model="values.firstLastName"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          autocomplete="family-name"
        />
      </UiField>
      <UiField
        id="register-second-last-name"
        v-slot="field"
        label="Segundo apellido"
        optional
        :error="fieldErrors.secondLastName"
      >
        <UiInput
          :id="field.id"
          v-model="values.secondLastName"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
        />
      </UiField>
    </div>

    <UiField
      id="register-email"
      v-slot="field"
      label="Correo"
      :error="fieldErrors.email"
    >
      <UiInput
        :id="field.id"
        v-model="values.email"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        type="email"
        autocomplete="email"
        autocapitalize="none"
        spellcheck="false"
      />
    </UiField>

    <UiField
      id="register-phone"
      v-slot="field"
      label="Teléfono"
      optional
      :error="fieldErrors.phoneNumber"
    >
      <UiInput
        :id="field.id"
        v-model="values.phoneNumber"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        type="tel"
        inputmode="tel"
        autocomplete="tel-national"
      />
    </UiField>

    <UiField
      id="register-username"
      v-slot="field"
      label="Nombre de usuario"
      hint="De 4 a 20 caracteres. Aparece en tus reseñas y no se puede cambiar."
      :error="fieldErrors.username"
    >
      <UiInput
        :id="field.id"
        v-model="values.username"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        autocomplete="username"
        autocapitalize="none"
        spellcheck="false"
        maxlength="20"
      />
    </UiField>

    <UiField
      id="register-password"
      v-slot="field"
      label="Contraseña"
      :error="fieldErrors.password"
    >
      <PasswordInput
        :id="field.id"
        v-model="values.password"
        :invalid="field.invalid"
        :aria-describedby="[field.describedBy, 'register-password-rules'].filter(Boolean).join(' ')"
        autocomplete="new-password"
      />
      <PasswordChecklist
        id="register-password-rules"
        :password="values.password"
      />
    </UiField>

    <div class="grid gap-2">
      <label class="flex items-start gap-3 text-sm leading-relaxed text-ink">
        <input
          v-model="values.acceptedPrivacyPolicy"
          type="checkbox"
          class="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
          :aria-invalid="Boolean(fieldErrors.acceptedPrivacyPolicy) || undefined"
          :aria-describedby="fieldErrors.acceptedPrivacyPolicy ? 'register-privacy-error' : undefined"
        >
        <span>
          He leído y acepto el
          <!-- TODO: enlazar a la pagina del Aviso de Privacidad cuando exista -->
          <NuxtLink
            to="/aviso-de-privacidad"
            target="_blank"
            class="font-medium text-accent underline-offset-2 hover:underline"
          >Aviso de Privacidad</NuxtLink>.
        </span>
      </label>
      <p
        v-if="fieldErrors.acceptedPrivacyPolicy"
        id="register-privacy-error"
        class="text-[13px] text-danger"
      >
        {{ fieldErrors.acceptedPrivacyPolicy }}
      </p>
    </div>

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
      {{ pending ? 'Creando tu cuenta' : 'Crear cuenta' }}
    </UiButton>
  </form>
</template>
