<script setup lang="ts">
import { useAuthStore } from '../stores/auth.store'

defineProps<{ collapsed?: boolean }>()

const auth = useAuthStore()
const pending = ref(false)

async function onLogout() {
  pending.value = true
  try {
    await auth.logout()
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <UButton
    color="neutral"
    variant="outline"
    icon="ph:sign-out"
    :label="collapsed ? undefined : 'Cerrar sesión'"
    :aria-label="collapsed ? 'Cerrar sesión' : undefined"
    :loading="pending"
    :block="!collapsed"
    @click="onLogout"
  />
</template>
