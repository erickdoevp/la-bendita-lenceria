<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import { ORDER_ROUTES, ORDER_TABS, emptyOrderFilters } from '../constants'
import { useOrdersListStore } from '../stores/orders-list.store'
import { customerName, isGuest, itemsCount } from '../utils/customer'
import OrderStatusBadge from './OrderStatusBadge.vue'

const store = useOrdersListStore()
const route = useRoute()

const page = computed(() => store.list.data)
const items = computed(() => page.value?.items ?? [])
const filters = computed(() => store.list.filters)
const statusTab = useSelectAll(store.list.filters, 'status')
const tabs = ORDER_TABS.map(tab => ({ label: tab.label, value: tab.status || SELECT_ALL }))

const search = useSearchTerm(() => store.list.filters.orderNumber, (value) => {
  store.list.filters.orderNumber = value
})

type OrderRow = NonNullable<typeof page.value>['items'][number]

const columns: TableColumn<OrderRow>[] = [
  { accessorKey: 'orderNumber', header: 'Orden' },
  { id: 'customer', header: 'Cliente' },
  { accessorKey: 'pickup', header: 'Entrega' },
  { accessorKey: 'total', header: 'Total', meta: { class: { th: 'text-right', td: 'text-right' } } },
  { accessorKey: 'status', header: 'Estado', meta: { class: { th: 'text-right', td: 'text-right' } } },
]

function onSelect(_event: Event, row: TableRow<OrderRow>) {
  navigateTo(ORDER_ROUTES.detail(row.original.id))
}

const searching = computed(() => Boolean(filters.value.orderNumber || filters.value.dateFrom || filters.value.dateTo || filters.value.userId))

watch(
  () => [filters.value.status, filters.value.orderNumber, filters.value.userId, filters.value.dateFrom, filters.value.dateTo],
  () => store.list.load(0),
)

// "Pedidos de este cliente" llega por URL (?userId=) desde el detalle de una orden
watch(() => route.query.userId, (value) => {
  const userId = typeof value === 'string' ? value : ''
  if (userId !== store.list.filters.userId) store.list.filters.userId = userId
  else store.list.load()
}, { immediate: true })

function clearCustomer() {
  navigateTo({ path: ORDER_ROUTES.list, query: {} }, { replace: true })
}

function clearFilters() {
  Object.assign(store.list.filters, emptyOrderFilters(), {
    status: store.list.filters.status,
    userId: store.list.filters.userId,
  })
}
</script>

<template>
  <UCard>
    <div class="grid gap-5">
      <UTabs
        v-model="statusTab"
        :items="tabs"
        :content="false"
        variant="link"
        aria-label="Estado de la orden"
        class="-mx-4 overflow-x-auto sm:-mx-6"
        :ui="{ list: 'px-4 sm:px-6' }"
      />

      <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10.5rem_10.5rem_auto] sm:items-end">
        <UInput
          v-model="search"
          type="search"
          icon="ph:magnifying-glass"
          placeholder="Buscar por número (ej. 00042)"
          aria-label="Buscar por número (ej. 00042)"
        />
        <UFormField
          label="Desde"
          :ui="{ label: 'text-xs text-muted' }"
        >
          <UInput
            v-model="store.list.filters.dateFrom"
            type="date"
            :max="filters.dateTo || undefined"
          />
        </UFormField>
        <UFormField
          label="Hasta"
          :ui="{ label: 'text-xs text-muted' }"
        >
          <UInput
            v-model="store.list.filters.dateTo"
            type="date"
            :min="filters.dateFrom || undefined"
          />
        </UFormField>
        <UButton
          v-if="filters.orderNumber || filters.dateFrom || filters.dateTo"
          color="neutral"
          variant="ghost"
          icon="ph:x"
          label="Limpiar"
          @click="clearFilters"
        />
      </div>

      <p
        v-if="filters.userId"
        class="flex flex-wrap items-center gap-2 text-sm text-muted"
      >
        Pedidos del cliente
        <UBadge
          :label="filters.userId"
          class="font-mono"
        >
          <template #trailing>
            <UButton
              variant="link"
              size="xs"
              icon="ph:x"
              class="p-0"
              aria-label="Quitar filtro de cliente"
              @click="clearCustomer"
            />
          </template>
        </UBadge>
      </p>

      <UAlert
        v-if="store.list.error"
        color="error"
        icon="ph:warning-circle"
        :title="store.list.error"
        :actions="retryAction(() => store.list.load())"
        orientation="horizontal"
      />

      <div
        v-if="store.list.pending && !page"
        class="grid gap-4"
        role="status"
        aria-label="Cargando órdenes"
      >
        <div
          v-for="row in 6"
          :key="row"
          class="flex items-center gap-4"
        >
          <div class="grid flex-1 gap-2">
            <USkeleton
              class="h-4 w-36"
            />
            <USkeleton
              class="h-3 w-24"
            />
          </div>
          <USkeleton
            class="hidden h-4 w-32 sm:block"
          />
          <USkeleton
            class="h-4 w-20"
          />
          <USkeleton
            class="h-6 w-24"
          />
        </div>
      </div>

      <UEmpty
        v-else-if="page && !items.length"
        icon="ph:receipt"
        :title="searching || filters.status ? 'Sin resultados' : 'Aún no hay órdenes'"
        :description="searching || filters.status ? 'Ninguna orden coincide con esta vista.' : 'Los pedidos de la tienda aparecerán aquí.'"
      />

      <UTable
        v-else-if="items.length"
        :data="items"
        :columns="columns"
        :class="['-mx-4 sm:-mx-6 transition-opacity', store.list.pending && 'opacity-60']"
        :aria-busy="store.list.pending || undefined"
        @select="onSelect"
      >
        <template #orderNumber-cell="{ row }">
          <span class="grid min-w-36 gap-0.5">
            <NuxtLink
              :to="ORDER_ROUTES.detail(row.original.id)"
              class="justify-self-start font-mono font-medium text-highlighted hover:underline"
              @click.stop
            >{{ row.original.orderNumber }}</NuxtLink>
            <span class="text-xs tabular-nums">{{ formatDateTime(row.original.createdAt) }}</span>
          </span>
        </template>
        <template #customer-cell="{ row }">
          <span class="grid min-w-40 gap-0.5">
            <span class="flex items-center gap-2">
              <span class="truncate text-highlighted">{{ customerName(row.original) }}</span>
              <UBadge
                v-if="isGuest(row.original)"
                color="neutral"
                size="sm"
                label="Invitado"
              />
            </span>
            <span class="text-xs">
              {{ itemsCount(row.original) }} {{ itemsCount(row.original) === 1 ? 'pieza' : 'piezas' }}
            </span>
          </span>
        </template>
        <template #pickup-cell="{ row }">
          <span class="inline-flex items-center gap-1.5">
            <UIcon
              :name="row.original.pickup ? 'ph:storefront' : 'ph:truck'"
              class="size-4"
            />
            {{ row.original.pickup ? 'Tienda' : 'Domicilio' }}
          </span>
        </template>
        <template #total-cell="{ row }">
          <span class="font-medium tabular-nums text-highlighted">{{ formatMoney(row.original.total) }}</span>
        </template>
        <template #status-cell="{ row }">
          <OrderStatusBadge :status="row.original.status" />
        </template>
      </UTable>

      <PagePagination
        v-if="page"
        :page="page"
        :disabled="store.list.pending"
        @change="store.list.load"
      />
    </div>
  </UCard>
</template>
