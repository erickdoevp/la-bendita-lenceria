<script setup lang="ts">
import { COUPON_ROUTES, CouponForm } from '~/features/coupons'
import type { Coupon } from '~/features/coupons'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Nuevo cupón | Panel La Bendita',
  robots: 'noindex, nofollow',
})

function onSaved(coupon: Coupon) {
  navigateTo({ path: COUPON_ROUTES.detail(coupon.id), query: { created: '1' } }, { replace: true })
}
</script>

<template>
  <div class="grid gap-8">
    <UiPageHeader
      title="Nuevo cupón"
      description="El resumen de la derecha se actualiza mientras llenas el formulario."
    />
    <CouponForm
      @saved="onSaved"
      @cancel="navigateTo(COUPON_ROUTES.list)"
    />
  </div>
</template>
