<script setup lang="ts">
import { ACCOUNT_ROUTES } from '~/features/account'
import { itemsCount, OrderStatusBadge } from '~/features/orders'
import type { Order } from '~/features/orders'

const MAX_THUMBS = 4

const props = defineProps<{ order: Order }>()

const thumbs = computed(() => props.order.items.slice(0, MAX_THUMBS))
const extra = computed(() => props.order.items.length - thumbs.value.length)
const count = computed(() => itemsCount(props.order))
</script>

<template>
  <NuxtLink
    :to="ACCOUNT_ROUTES.orderDetail(order.id)"
    class="group grid gap-4 rounded-2xl border border-line bg-surface-raised p-5 transition-[border-color,transform] duration-200 hover:border-ink-muted focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.995] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
  >
    <div class="grid min-w-0 gap-3">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span class="font-mono text-sm font-medium text-ink">{{ order.orderNumber }}</span>
        <OrderStatusBadge :status="order.status" />
      </div>
      <p class="text-sm text-ink-muted">
        {{ formatDateTime(order.createdAt) }} · {{ count }} {{ count === 1 ? 'pieza' : 'piezas' }} ·
        {{ order.pickup ? 'Recoger en tienda' : 'Envío a domicilio' }}
      </p>
      <ul
        class="flex items-center gap-2"
        aria-hidden="true"
      >
        <li
          v-for="item in thumbs"
          :key="item.id"
        >
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            alt=""
            loading="lazy"
            class="aspect-[4/5] w-11 rounded-lg border border-line object-cover"
          >
          <span
            v-else
            class="grid aspect-[4/5] w-11 place-items-center rounded-lg bg-surface text-ink-muted"
          >
            <Icon
              name="ph:image"
              class="size-4"
            />
          </span>
        </li>
        <li
          v-if="extra > 0"
          class="grid aspect-[4/5] w-11 place-items-center rounded-lg bg-surface text-xs font-medium text-ink-muted"
        >
          +{{ extra }}
        </li>
      </ul>
    </div>

    <div class="flex items-center justify-between gap-3 sm:justify-end">
      <span class="text-lg font-semibold tabular-nums text-ink">{{ formatMoney(order.total) }}</span>
      <Icon
        name="ph:caret-right"
        class="size-5 text-ink-muted transition-transform duration-200 group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </div>
  </NuxtLink>
</template>
