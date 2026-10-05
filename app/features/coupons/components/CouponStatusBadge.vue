<script setup lang="ts">
import { COUPON_STATUS_COLORS, COUPON_STATUS_LABELS } from '../constants'
import type { Coupon } from '../types'
import { couponStatus } from '../utils/coupon'

const props = defineProps<{ coupon: Coupon }>()

const status = computed(() => couponStatus(props.coupon))
</script>

<template>
  <UBadge
    :color="COUPON_STATUS_COLORS[status]"
    :label="COUPON_STATUS_LABELS[status]"
  />
</template>
