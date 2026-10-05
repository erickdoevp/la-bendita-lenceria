<script setup lang="ts">
import { CUSTOMER_AUTH_ROUTES, CustomerAuthShell, getSafeStoreRedirect, RegisterForm } from '~/features/customer-auth'

definePageMeta({
  layout: false,
  middleware: 'customer-guest',
})

useSeoMeta({
  title: 'Crear cuenta | La Bendita Lencería',
  robots: 'noindex, nofollow',
})

const route = useRoute()

const loginTo = computed(() => ({
  path: CUSTOMER_AUTH_ROUTES.login,
  query: route.query.redirect ? { redirect: route.query.redirect } : undefined,
}))

async function onSuccess() {
  // El registro deja la sesion iniciada
  await navigateTo(getSafeStoreRedirect(route.query.redirect), { replace: true })
}
</script>

<template>
  <CustomerAuthShell
    title="Crea tu cuenta"
    description="Guarda tus direcciones, sigue tus pedidos y solicita tus facturas en un solo lugar."
  >
    <RegisterForm @success="onSuccess" />

    <template #footer>
      ¿Ya tienes cuenta?
      <NuxtLink
        :to="loginTo"
        class="font-medium text-primary underline-offset-2 hover:underline"
      >
        Inicia sesión
      </NuxtLink>
    </template>
  </CustomerAuthShell>
</template>
