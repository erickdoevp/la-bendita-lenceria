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
    <UiPageHeader
      title="Cupones"
      description="Códigos de descuento para clientas con cuenta. Cada una puede usar un cupón una sola vez."
    >
      <template #actions>
        <UiButton
          icon="ph:plus"
          :to="COUPON_ROUTES.create"
        >
          Nuevo cupón
        </UiButton>
      </template>
    </UiPageHeader>
    <CouponsManager />
  </div>
</template>
