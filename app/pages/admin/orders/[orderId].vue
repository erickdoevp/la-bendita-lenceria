<script setup lang="ts">
import { OrderDetail } from '~/features/orders'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Detalle de orden | Panel La Bendita',
  robots: 'noindex, nofollow',
})

const route = useRoute()
// Con :key, al navegar entre ordenes se reinicia el estado del detalle
const orderId = computed(() => String(route.params.orderId))
</script>

<template>
  <OrderDetail
    :key="orderId"
    :order-id="orderId"
  />
</template>
