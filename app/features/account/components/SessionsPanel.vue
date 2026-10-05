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
    <UAlert
      v-if="error"
      color="error"
      icon="ph:warning-circle"
      :title="error"
    />

    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-muted">
        Cierra la sesión solo en este navegador.
      </p>
      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        icon="ph:sign-out"
        :loading="pending === 'one'"
        :disabled="pending === 'all'"
        label="Cerrar sesión"
        @click="logout"
      />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-default pt-4">
      <p class="max-w-[46ch] text-sm text-muted">
        ¿Entraste desde un equipo que no es tuyo? Cierra la sesión en todos tus dispositivos a la vez.
      </p>
      <div
        v-if="confirmingAll"
        class="flex gap-1.5"
      >
        <UButton
          color="error"
          variant="soft"
          size="sm"
          :loading="pending === 'all'"
          label="Sí, cerrar todas"
          @click="logoutAll"
        />
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          :disabled="pending === 'all'"
          label="No"
          @click="confirmingAll = false"
        />
      </div>
      <UButton
        v-else
        color="neutral"
        variant="ghost"
        size="sm"
        icon="ph:devices"
        :disabled="pending === 'one'"
        label="Cerrar en todos"
        @click="confirmingAll = true"
      />
    </div>
  </div>
</template>
