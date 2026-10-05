<script setup lang="ts">
import { MyOrdersList } from '~/features/customer-orders'

definePageMeta({
  layout: 'account',
  middleware: 'customer',
})

useSeoMeta({
  title: 'Mis pedidos | La Bendita Lencería',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <MyOrdersList />
</template>
