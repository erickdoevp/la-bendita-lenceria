<script setup lang="ts">
import { COUPON_ROUTES, CouponsManager } from '~/features/coupons'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Cupones | Panel La Bendita',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="grid gap-8">
    <UPageHeader
      title="Cupones"
      description="Códigos de descuento para clientas con cuenta. Cada una puede usar un cupón una sola vez."
    >
      <template #links>
        <UButton
          icon="ph:plus"
          label="Nuevo cupón"
          :to="COUPON_ROUTES.create"
        />
      </template>
    </UPageHeader>
    <CouponsManager />
  </div>
</template>
