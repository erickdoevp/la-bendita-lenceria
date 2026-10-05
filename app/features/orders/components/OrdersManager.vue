<script setup lang="ts">
import { ORDER_ROUTES, ORDER_TABS, emptyOrderFilters } from '../constants'
import { useOrdersListStore } from '../stores/orders-list.store'
import { customerName, isGuest, itemsCount } from '../utils/customer'
import OrderStatusBadge from './OrderStatusBadge.vue'

const store = useOrdersListStore()
const route = useRoute()

const page = computed(() => store.list.data)
const items = computed(() => page.value?.items ?? [])
const filters = computed(() => store.list.filters)
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
  <UiPanel>
    <div class="grid gap-5">
      <div
        class="-mx-5 flex gap-1 overflow-x-auto border-b border-line px-5 sm:-mx-6 sm:px-6"
        role="tablist"
        aria-label="Estado de la orden"
      >
        <button
          v-for="tab in ORDER_TABS"
          :key="tab.status"
          type="button"
          role="tab"
          :aria-selected="filters.status === tab.status"
          class="-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 pb-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent"
          :class="filters.status === tab.status ? 'border-accent text-ink' : 'border-transparent text-ink-muted hover:text-ink'"
          @click="store.list.filters.status = tab.status"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10.5rem_10.5rem_auto] sm:items-end">
        <UiSearch
          id="orders-search"
          v-model="store.list.filters.orderNumber"
          label="Buscar por número (ej. 00042)"
        />
        <div class="grid gap-1.5">
          <label
            for="orders-from"
            class="text-xs font-medium text-ink-muted"
          >Desde</label>
          <UiInput
            id="orders-from"
            v-model="store.list.filters.dateFrom"
            type="date"
            size="sm"
            :max="filters.dateTo || undefined"
          />
        </div>
        <div class="grid gap-1.5">
          <label
            for="orders-to"
            class="text-xs font-medium text-ink-muted"
          >Hasta</label>
          <UiInput
            id="orders-to"
            v-model="store.list.filters.dateTo"
            type="date"
            size="sm"
            :min="filters.dateFrom || undefined"
          />
        </div>
        <UiButton
          v-if="filters.orderNumber || filters.dateFrom || filters.dateTo"
          variant="ghost"
          size="sm"
          icon="ph:x"
          class="h-10"
          @click="clearFilters"
        >
          Limpiar
        </UiButton>
      </div>

      <p
        v-if="filters.userId"
        class="flex flex-wrap items-center gap-2 text-sm text-ink-muted"
      >
        Pedidos del cliente
        <span class="inline-flex items-center gap-1 rounded-lg bg-accent/10 py-1 pl-2 pr-1 font-mono text-xs text-accent">
          {{ filters.userId }}
          <button
            type="button"
            class="grid size-5 place-items-center rounded-md hover:bg-accent/15 focus-visible:outline-2 focus-visible:outline-accent"
            aria-label="Quitar filtro de cliente"
            @click="clearCustomer"
          >
            <Icon
              name="ph:x"
              class="size-3"
              aria-hidden="true"
            />
          </button>
        </span>
      </p>

      <UiAlert v-if="store.list.error">
        {{ store.list.error }}
        <button
          type="button"
          class="ml-1 font-medium underline underline-offset-2"
          @click="store.list.load()"
        >
          Reintentar
        </button>
      </UiAlert>

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
            <UiSkeleton class="h-4 w-36" />
            <UiSkeleton class="h-3 w-24" />
          </div>
          <UiSkeleton class="hidden h-4 w-32 sm:block" />
          <UiSkeleton class="h-4 w-20" />
          <UiSkeleton class="h-6 w-24" />
        </div>
      </div>

      <UiEmptyState
        v-else-if="page && !items.length"
        icon="ph:receipt"
        :title="searching || filters.status ? 'Sin resultados' : 'Aún no hay órdenes'"
        :description="searching || filters.status ? 'Ninguna orden coincide con esta vista.' : 'Los pedidos de la tienda aparecerán aquí.'"
      />

      <div
        v-else-if="items.length"
        class="-mx-5 overflow-x-auto sm:-mx-6"
      >
        <table class="w-full text-left text-sm">
          <thead class="text-ink-muted">
            <tr>
              <th class="px-5 pb-3 font-medium sm:px-6">
                Orden
              </th>
              <th class="pb-3 pr-4 font-medium">
                Cliente
              </th>
              <th class="pb-3 pr-4 font-medium">
                Entrega
              </th>
              <th class="pb-3 pr-4 text-right font-medium">
                Total
              </th>
              <th class="px-5 pb-3 text-right font-medium sm:px-6">
                Estado
              </th>
            </tr>
          </thead>
          <tbody
            class="divide-y divide-line border-t border-line transition-opacity"
            :class="store.list.pending && 'opacity-60'"
            :aria-busy="store.list.pending || undefined"
          >
            <tr
              v-for="order in items"
              :key="order.id"
              class="cursor-pointer transition-colors hover:bg-surface"
              @click="navigateTo(ORDER_ROUTES.detail(order.id))"
            >
              <td class="px-5 py-3 sm:px-6">
                <span class="grid min-w-36 gap-0.5">
                  <NuxtLink
                    :to="ORDER_ROUTES.detail(order.id)"
                    class="justify-self-start rounded-md font-mono font-medium text-ink hover:underline focus-visible:outline-2 focus-visible:outline-accent"
                    @click.stop
                  >{{ order.orderNumber }}</NuxtLink>
                  <span class="whitespace-nowrap text-xs tabular-nums text-ink-muted">{{ formatDateTime(order.createdAt) }}</span>
                </span>
              </td>
              <td class="py-3 pr-4">
                <span class="grid min-w-40 gap-0.5">
                  <span class="flex items-center gap-2">
                    <span class="truncate text-ink">{{ customerName(order) }}</span>
                    <span
                      v-if="isGuest(order)"
                      class="shrink-0 rounded-md bg-surface px-1.5 py-0.5 text-[11px] font-medium text-ink-muted"
                    >Invitado</span>
                  </span>
                  <span class="text-xs text-ink-muted">
                    {{ itemsCount(order) }} {{ itemsCount(order) === 1 ? 'pieza' : 'piezas' }}
                  </span>
                </span>
              </td>
              <td class="whitespace-nowrap py-3 pr-4 text-ink-muted">
                <span class="inline-flex items-center gap-1.5">
                  <Icon
                    :name="order.pickup ? 'ph:storefront' : 'ph:truck'"
                    class="size-4"
                    aria-hidden="true"
                  />
                  {{ order.pickup ? 'Tienda' : 'Domicilio' }}
                </span>
              </td>
              <td class="whitespace-nowrap py-3 pr-4 text-right font-medium tabular-nums text-ink">
                {{ formatMoney(order.total) }}
              </td>
              <td class="px-5 py-3 text-right sm:px-6">
                <OrderStatusBadge :status="order.status" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <UiPagination
        v-if="page"
        :page="page.page"
        :total-pages="page.totalPages"
        :total-elements="page.totalElements"
        :disabled="store.list.pending"
        @change="store.list.load"
      />
    </div>
  </UiPanel>
</template>
