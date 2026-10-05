<script setup lang="ts">
import type { Order } from '../types'
import { itemsCount } from '../utils/customer'

const props = defineProps<{ order: Order }>()

const count = computed(() => itemsCount(props.order))
</script>

<template>
  <UCard
    title="Artículos"
    :description="`${count} ${count === 1 ? 'pieza' : 'piezas'}. Precios con IVA incluido.`"
  >
    <div class="grid gap-5">
      <ul class="-mx-5 divide-y divide-default border-y border-default sm:-mx-6">
        <li
          v-for="item in order.items"
          :key="item.id"
          class="flex items-center gap-3 px-5 py-3 sm:px-6"
        >
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            alt=""
            loading="lazy"
            class="aspect-[4/5] w-11 shrink-0 rounded-lg border border-default object-cover"
          >
          <span
            v-else
            class="grid aspect-[4/5] w-11 shrink-0 place-items-center rounded-lg bg-muted text-muted"
          >
            <UIcon
              name="ph:image"
              class="size-4"
              aria-hidden="true"
            />
          </span>
          <span class="grid min-w-0 flex-1 gap-0.5">
            <span class="truncate font-medium text-highlighted">{{ item.productName }}</span>
            <span class="truncate text-xs text-muted">
              {{ item.colorName }} · {{ item.sizeName }} · <span class="font-mono">{{ item.sku }}</span>
            </span>
          </span>
          <span class="grid shrink-0 justify-items-end gap-0.5 text-sm tabular-nums">
            <span class="font-medium text-highlighted">{{ formatMoney(item.subtotal) }}</span>
            <span class="text-xs text-muted">{{ item.quantity }} × {{ formatMoney(item.unitPrice) }}</span>
          </span>
        </li>
      </ul>

      <dl class="ml-auto grid w-full max-w-xs gap-2 text-sm tabular-nums">
        <div class="flex justify-between gap-4">
          <dt class="text-muted">
            Subtotal
          </dt>
          <dd class="text-highlighted">
            {{ formatMoney(order.subtotal) }}
          </dd>
        </div>
        <div
          v-if="order.discountAmount > 0"
          class="flex justify-between gap-4"
        >
          <dt class="text-muted">
            Descuento
            <span
              v-if="order.couponCode"
              class="ml-1 rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] text-primary"
            >{{ order.couponCode }}</span>
          </dt>
          <dd class="text-success">
            −{{ formatMoney(order.discountAmount) }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-muted">
            Envío
            <span
              v-if="order.shippingConfigName"
              class="text-xs"
            >({{ order.shippingConfigName }})</span>
          </dt>
          <dd class="text-highlighted">
            {{ order.shippingCost > 0 ? formatMoney(order.shippingCost) : 'Gratis' }}
          </dd>
        </div>
        <div class="flex justify-between gap-4 border-t border-default pt-2 text-base font-semibold">
          <dt class="text-highlighted">
            Total
          </dt>
          <dd class="text-highlighted">
            {{ formatMoney(order.total) }}
          </dd>
        </div>
        <div class="flex justify-between gap-4 text-xs">
          <dt class="text-muted">
            IVA incluido
          </dt>
          <dd class="text-muted">
            {{ formatMoney(order.taxAmount) }}
          </dd>
        </div>
      </dl>
    </div>
  </UCard>
</template>
