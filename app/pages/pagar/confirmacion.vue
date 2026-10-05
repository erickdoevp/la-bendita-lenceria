<script setup lang="ts">
import { useCustomerAuthStore } from '~/features/customer-auth'
import { CheckoutResultView } from '~/features/store-checkout'

definePageMeta({ layout: 'checkout' })

useSeoMeta({
  title: 'Tu pedido | La Bendita Lencería',
  robots: 'noindex, nofollow',
})

const route = useRoute()
// Stripe agrega payment_intent y redirect_status al volver: solo orientan, la verdad es el backend
const orderId = computed(() => {
  const value = route.query.pedido
  return (Array.isArray(value) ? value[0] : value) ?? null
})

await useCustomerAuthStore().restoreSession()
</script>

<template>
  <CheckoutResultView :order-id="orderId" />
</template>
