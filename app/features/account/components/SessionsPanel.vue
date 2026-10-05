<script setup lang="ts">
import { useCustomerAuthStore } from '~/features/customer-auth'

const auth = useCustomerAuthStore()
const pending = ref<'one' | 'all' | null>(null)
const confirmingAll = ref(false)
const error = ref<string | null>(null)

async function logout() {
  pending.value = 'one'
  try {
    await auth.logout()
  }
  finally {
    pending.value = null
  }
}

async function logoutAll() {
  pending.value = 'all'
  error.value = null
  try {
    await auth.logoutAll()
  }
  catch (e) {
    error.value = parseApiError(e).message
  }
  finally {
    pending.value = null
  }
}
</script>

<template>
  <div class="grid gap-4">
    <UiAlert v-if="error">
      {{ error }}
    </UiAlert>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-ink-muted">
        Cierra la sesión solo en este navegador.
      </p>
      <UiButton
        variant="secondary"
        size="sm"
        icon="ph:sign-out"
        :loading="pending === 'one'"
        :disabled="pending === 'all'"
        @click="logout"
      >
        Cerrar sesión
      </UiButton>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
      <p class="max-w-[46ch] text-sm text-ink-muted">
        ¿Entraste desde un equipo que no es tuyo? Cierra la sesión en todos tus dispositivos a la vez.
      </p>
      <div
        v-if="confirmingAll"
        class="flex gap-1.5"
      >
        <UiButton
          variant="danger"
          size="sm"
          :loading="pending === 'all'"
          @click="logoutAll"
        >
          Sí, cerrar todas
        </UiButton>
        <UiButton
          variant="ghost"
          size="sm"
          :disabled="pending === 'all'"
          @click="confirmingAll = false"
        >
          No
        </UiButton>
      </div>
      <UiButton
        v-else
        variant="ghost"
        size="sm"
        icon="ph:devices"
        :disabled="pending === 'one'"
        @click="confirmingAll = true"
      >
        Cerrar en todos
      </UiButton>
    </div>
  </div>
</template>
