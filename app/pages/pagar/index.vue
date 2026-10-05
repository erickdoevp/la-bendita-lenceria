<script setup lang="ts">
import { useCustomerAuthStore } from '~/features/customer-auth'
import { CheckoutView } from '~/features/store-checkout'

definePageMeta({ layout: 'checkout' })

useSeoMeta({
  title: 'Pagar | La Bendita Lencería',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const resumeOrderId = computed(() => {
  const value = route.query.pedido
  return (Array.isArray(value) ? value[0] : value) ?? null
})

// Sin SSR (routeRules): se espera la sesion para saber si es clienta o invitada
await useCustomerAuthStore().restoreSession()
</script>

<template>
  <CheckoutView :resume-order-id="resumeOrderId" />
</template>
