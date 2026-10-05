<script setup lang="ts">
import { OrdersManager } from '~/features/orders'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Órdenes | Panel La Bendita',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="grid gap-8">
    <UPageHeader
      title="Órdenes"
      description="Pedidos de la tienda. Usa las pestañas para ver lo que falta cobrar, preparar, enviar o entregar."
    />
    <OrdersManager />
  </div>
</template>
