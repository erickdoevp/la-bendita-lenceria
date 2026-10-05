<script setup lang="ts">
import { useLoginForm } from '../composables/useLoginForm'
import LoginField from './LoginField.vue'
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
    <Transition
      enter-active-class="motion-safe:transition motion-safe:duration-200"
      enter-from-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="formError"
        role="alert"
        class="flex items-start gap-3 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
      >
        <Icon
          name="ph:warning-circle"
          class="mt-px size-5 shrink-0"
          aria-hidden="true"
        />
        <p>{{ formError }}</p>
      </div>
    </Transition>

    <LoginField
      id="usernameOrEmail"
      v-model="values.usernameOrEmail"
      label="Usuario o correo"
      autocomplete="username"
      :error="fieldErrors.usernameOrEmail"
      :disabled="pending"
    />

    <LoginField
      id="password"
      v-model="values.password"
      label="Contraseña"
      :type="showPassword ? 'text' : 'password'"
      autocomplete="current-password"
      :error="fieldErrors.password"
      :disabled="pending"
    >
      <template #trailing>
        <button
          type="button"
          class="grid size-9 place-items-center rounded-lg text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          :aria-pressed="showPassword"
          @click="showPassword = !showPassword"
        >
          <Icon
            :name="showPassword ? 'ph:eye-slash' : 'ph:eye'"
            class="size-5"
            aria-hidden="true"
          />
        </button>
      </template>
    </LoginField>

    <TurnstileWidget
      v-if="turnstileEnabled"
      ref="turnstile"
      :site-key="turnstileSiteKey"
      @verify="turnstileToken = $event"
      @expire="turnstileToken = null"
      @error="turnstileToken = null"
    />

    <button
      type="submit"
      :disabled="pending"
      class="mt-1 inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-accent px-5 text-[15px] font-medium text-accent-ink transition-[background-color,transform] duration-200 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
    >
      <Icon
        v-if="pending"
        name="ph:circle-notch"
        class="size-5 motion-safe:animate-spin"
        aria-hidden="true"
      />
      {{ pending ? 'Entrando' : 'Iniciar sesión' }}
    </button>
  </form>
</template>
