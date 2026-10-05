<script setup lang="ts">
import { INVENTORY_ROUTES, LowStockPanel, StockManager } from '~/features/inventory'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Existencias | Panel La Bendita',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="grid gap-8">
    <UPageHeader
      title="Existencias"
      description="Stock por variante. Reservado son unidades en pedidos sin pagar: siguen en almacén pero no se pueden vender."
    >
      <template #links>
        <UButton
          color="neutral"
          variant="outline"
          icon="ph:arrows-down-up"
          :to="INVENTORY_ROUTES.movements"
          label="Ver movimientos"
        />
      </template>
    </UPageHeader>
    <LowStockPanel />
    <StockManager />
  </div>
</template>
