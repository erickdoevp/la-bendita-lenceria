<script setup lang="ts">
import { COUPON_STATUS_CLASSES, COUPON_STATUS_LABELS } from '../constants'
import type { Coupon } from '../types'
import { couponStatus } from '../utils/coupon'

const props = defineProps<{ coupon: Coupon }>()

const status = computed(() => couponStatus(props.coupon))
</script>

<template>
  <span
    class="inline-flex whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium"
    :class="COUPON_STATUS_CLASSES[status]"
  >
    {{ COUPON_STATUS_LABELS[status] }}
  </span>
</template>
