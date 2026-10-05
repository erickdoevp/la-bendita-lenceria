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
    <UiPageHeader
      title="Existencias"
      description="Stock por variante. Reservado son unidades en pedidos sin pagar: siguen en almacén pero no se pueden vender."
    >
      <template #actions>
        <UiButton
          variant="secondary"
          icon="ph:arrows-down-up"
          :to="INVENTORY_ROUTES.movements"
        >
          Ver movimientos
        </UiButton>
      </template>
    </UiPageHeader>
    <LowStockPanel />
    <StockManager />
  </div>
</template>
