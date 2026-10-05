<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { ORDER_ROUTES } from '~/features/orders'
import type { CouponUsage } from '../types'

defineProps<{
  page: Page<CouponUsage> | null
  pending: boolean
  error: string | null
}>()
const emit = defineEmits<{ change: [page: number], retry: [] }>()

const columns: TableColumn<CouponUsage>[] = [
  { accessorKey: 'usedAt', header: 'Fecha' },
  { accessorKey: 'username', header: 'Clienta' },
  { accessorKey: 'orderId', header: 'Orden', meta: { class: { th: 'text-right', td: 'text-right' } } },
]
</script>

<template>
  <UCard
    title="Usos"
    description="Quién lo usó y en qué orden. Si una orden se canceló sin pagar, su uso se devolvió y no aparece."
  >
    <div class="grid gap-5">
      <UAlert
        v-if="error"
        color="error"
        icon="ph:warning-circle"
        :title="error"
        :actions="retryAction(() => emit('retry'))"
        orientation="horizontal"
      />

      <div
        v-else-if="pending && !page"
        class="grid gap-3"
        role="status"
        aria-label="Cargando usos"
      >
        <USkeleton
          v-for="row in 3"
          :key="row"
          class="h-5"
        />
      </div>

      <p
        v-else-if="page && !page.items.length"
        class="text-sm text-muted"
      >
        Nadie lo ha usado todavía.
      </p>

      <UTable
        v-else-if="page"
        :data="page.items"
        :columns="columns"
        :class="['-mx-4 sm:-mx-6 transition-opacity', pending && 'opacity-60']"
      >
        <template #usedAt-cell="{ row }">
          <span class="tabular-nums">{{ formatDateTime(row.original.usedAt) }}</span>
        </template>
        <template #username-cell="{ row }">
          <span class="text-highlighted">{{ row.original.username }}</span>
        </template>
        <template #orderId-cell="{ row }">
          <ULink
            :to="ORDER_ROUTES.detail(row.original.orderId)"
            class="inline-flex items-center gap-1 font-mono text-primary hover:underline"
            :title="`Ver la orden ${row.original.orderId}`"
          >
            <UIcon
              name="ph:receipt"
              class="size-3.5"
            />
            #{{ row.original.orderId.slice(0, 8) }}
          </ULink>
        </template>
      </UTable>

      <PagePagination
        v-if="page"
        :page="page"
        :disabled="pending"
        @change="emit('change', $event)"
      />
    </div>
  </UCard>
</template>
