<script setup lang="ts">
import { CUSTOMER_AUTH_ROUTES } from '../constants'
import { useCustomerAuthStore } from '../stores/customer-auth.store'
import CustomerAvatar from './CustomerAvatar.vue'

const auth = useCustomerAuthStore()
const route = useRoute()

// Vuelve a la pagina actual tras entrar (p. ej. el checkout)
const loginTo = computed(() => ({
  path: CUSTOMER_AUTH_ROUTES.login,
  query: route.path === CUSTOMER_AUTH_ROUTES.home ? undefined : { redirect: route.fullPath },
}))
</script>

<template>
  <!-- Mientras se restaura la sesion no se muestra "Entrar" para evitar un parpadeo -->
  <div class="flex min-h-10 items-center">
    <NuxtLink
      v-if="auth.isAuthenticated && auth.user"
      :to="CUSTOMER_AUTH_ROUTES.account"
      class="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 text-sm font-medium text-highlighted transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
    >
      <CustomerAvatar :user="auth.user" />
      <span class="max-w-[12ch] truncate">Hola, {{ auth.user.name }}</span>
    </NuxtLink>
    <NuxtLink
      v-else-if="auth.initialized"
      :to="loginTo"
      class="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-highlighted transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
    >
      <UIcon
        name="ph:user-circle"
        class="size-5"
        aria-hidden="true"
      />
      Entrar
    </NuxtLink>
  </div>
</template>
