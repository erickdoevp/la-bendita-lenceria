<script setup lang="ts">
import { CUSTOMER_AUTH_ROUTES, CustomerAuthShell, CustomerLoginForm, getSafeStoreRedirect, LOGIN_NOTICES } from '~/features/customer-auth'
import type { LoginNotice } from '~/features/customer-auth'

definePageMeta({
  layout: false,
  middleware: 'customer-guest',
})

useSeoMeta({
  title: 'Iniciar sesión | La Bendita Lencería',
  robots: 'noindex, nofollow',
})

const route = useRoute()

const notice = computed(() => LOGIN_NOTICES[route.query.notice as LoginNotice] ?? null)
const registerTo = computed(() => ({
  path: CUSTOMER_AUTH_ROUTES.register,
  query: route.query.redirect ? { redirect: route.query.redirect } : undefined,
}))

async function onSuccess() {
  // Volver a la pagina de donde vino (p. ej. el checkout)
  await navigateTo(getSafeStoreRedirect(route.query.redirect), { replace: true })
}
</script>

<template>
  <CustomerAuthShell
    title="Inicia sesión"
    description="Entra con tu usuario o correo para ver tus pedidos, direcciones y facturas."
  >
    <UAlert
      v-if="notice"
      color="primary"
      icon="ph:info"
      class="mb-6"
      :title="notice"
    />

    <CustomerLoginForm @success="onSuccess" />

    <template #footer>
      ¿Aún no tienes cuenta?
      <NuxtLink
        :to="registerTo"
        class="font-medium text-primary underline-offset-2 hover:underline"
      >
        Crear cuenta
      </NuxtLink>
    </template>
  </CustomerAuthShell>
</template>
