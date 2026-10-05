<script setup lang="ts">
import { MyOrderDetail } from '~/features/customer-orders'

definePageMeta({
  layout: 'account',
  middleware: 'customer',
})

useSeoMeta({
  title: 'Detalle del pedido | La Bendita Lencería',
  robots: 'noindex, nofollow',
})

const route = useRoute()
// Con :key, al navegar entre pedidos se reinicia el estado del detalle
const orderId = computed(() => String(route.params.orderId))
</script>

<template>
  <MyOrderDetail
    :key="orderId"
    :order-id="orderId"
  />
</template>
