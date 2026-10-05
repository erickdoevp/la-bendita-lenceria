<script setup lang="ts">
import { MovementsManager } from '~/features/inventory'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Movimientos | Panel La Bendita',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="grid gap-8">
    <UPageHeader
      title="Movimientos"
      description="Kardex de todo el inventario. Solo aparecen ventas pagadas: un pedido sin pagar aparta stock pero no lo mueve."
    />
    <MovementsManager />
  </div>
</template>
