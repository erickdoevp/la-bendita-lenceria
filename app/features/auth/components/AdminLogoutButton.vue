<script setup lang="ts">
import { useAuthStore } from '../stores/auth.store'

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
  <button
    type="button"
    :disabled="pending"
    class="inline-flex h-9 items-center gap-2 rounded-xl border border-line px-3.5 text-sm font-medium text-ink transition-[background-color,transform] duration-200 hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.98] disabled:opacity-60"
    @click="onLogout"
  >
    <Icon
      name="ph:sign-out"
      class="size-4"
      aria-hidden="true"
    />
    Cerrar sesión
  </button>
</template>
