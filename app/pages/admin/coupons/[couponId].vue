<script setup lang="ts">
import { CouponDetail } from '~/features/coupons'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Cupón | Panel La Bendita',
  robots: 'noindex, nofollow',
})

const route = useRoute()
// Con :key, al navegar entre cupones se reinicia el estado del detalle
const couponId = computed(() => String(route.params.couponId))
</script>

<template>
  <CouponDetail
    :key="couponId"
    :coupon-id="couponId"
    :created="route.query.created === '1'"
  />
</template>
