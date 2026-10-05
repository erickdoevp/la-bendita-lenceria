<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import { COUPON_ROUTES, COUPON_STATUS_FILTERS } from '../constants'
import { useCouponsStore } from '../stores/coupons.store'
import type { Coupon } from '../types'
import { formatCouponValue } from '../utils/coupon'
import CouponStatusBadge from './CouponStatusBadge.vue'

const store = useCouponsStore()
const togglingId = ref<string | null>(null)
const actionError = ref<string | null>(null)

const search = useSearchTerm(() => store.filters.code, (value) => {
  store.filters.code = value
})
const status = useSelectAll(store.filters, 'status')
const statusItems = COUPON_STATUS_FILTERS.map(option => ({ label: option.label, value: option.value || SELECT_ALL }))

const filtering = computed(() => Boolean(store.filters.code || store.filters.status))

const columns: TableColumn<Coupon>[] = [
  { accessorKey: 'code', header: 'Código' },
  { id: 'discount', header: 'Descuento' },
  { id: 'conditions', header: 'Condiciones' },
  { id: 'uses', header: 'Usos', meta: { class: { th: 'text-right', td: 'text-right' } } },
  { accessorKey: 'expiresAt', header: 'Vence' },
  { id: 'status', header: 'Estado' },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, 'Acciones'), meta: { class: { td: 'text-right' } } },
]

onMounted(() => store.load())

function clearFilters() {
  Object.assign(store.filters, { code: '', status: '' })
}

function onSelect(_event: Event, row: TableRow<Coupon>) {
  navigateTo(COUPON_ROUTES.detail(row.original.id))
}

async function onToggle(coupon: Coupon) {
  togglingId.value = coupon.id
  actionError.value = null
  try {
    await store.toggle(coupon.id)
  }
  catch (error) {
    actionError.value = parseApiError(error).message
  }
  finally {
    togglingId.value = null
  }
}
</script>

<template>
  <UCard>
    <div class="grid gap-5">
      <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <UInput
          v-model="search"
          type="search"
          icon="ph:magnifying-glass"
          placeholder="Buscar por código o descripción"
          aria-label="Buscar por código o descripción"
        />
        <USelect
          v-model="status"
          :items="statusItems"
          aria-label="Estado"
        />
      </div>

      <UAlert
        v-if="actionError || store.error"
        color="error"
        icon="ph:warning-circle"
        :title="actionError ?? store.error ?? undefined"
        :actions="store.error ? retryAction(store.load) : undefined"
        orientation="horizontal"
      />

      <div
        v-if="store.pending && !store.loaded"
        class="grid gap-4"
        role="status"
        aria-label="Cargando cupones"
      >
        <div
          v-for="row in 5"
          :key="row"
          class="flex items-center gap-4"
        >
          <div class="grid flex-1 gap-2">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-3 w-48" />
          </div>
          <USkeleton class="hidden h-4 w-20 sm:block" />
          <USkeleton class="h-4 w-14" />
          <USkeleton class="h-6 w-16" />
        </div>
      </div>

      <UEmpty
        v-else-if="store.loaded && !store.filtered.length"
        icon="ph:ticket"
        :title="filtering ? 'Sin resultados' : 'Aún no hay cupones'"
        :description="filtering ? 'Ningún cupón coincide con estos filtros.' : 'Crea un código de descuento para tus clientas.'"
      >
        <template #actions>
          <UButton
            v-if="filtering"
            color="neutral"
            variant="outline"
            size="sm"
            icon="ph:x"
            label="Limpiar filtros"
            @click="clearFilters"
          />
          <UButton
            v-else
            size="sm"
            icon="ph:plus"
            label="Nuevo cupón"
            :to="COUPON_ROUTES.create"
          />
        </template>
      </UEmpty>

      <UTable
        v-else-if="store.filtered.length"
        :data="store.filtered"
        :columns="columns"
        :class="['-mx-4 sm:-mx-6 transition-opacity', store.pending && 'opacity-60']"
        @select="onSelect"
      >
        <template #code-cell="{ row }">
          <span class="grid min-w-40 gap-0.5">
            <NuxtLink
              :to="COUPON_ROUTES.detail(row.original.id)"
              class="justify-self-start font-mono font-semibold tracking-wide text-highlighted hover:underline"
              @click.stop
            >{{ row.original.code }}</NuxtLink>
            <span
              v-if="row.original.description"
              class="line-clamp-1 text-xs"
            >{{ row.original.description }}</span>
          </span>
        </template>

        <template #discount-cell="{ row }">
          <span class="font-medium tabular-nums text-highlighted">{{ formatCouponValue(row.original) }}</span>
          <span
            v-if="row.original.valueType === 'PERCENTAGE' && row.original.maxDiscountAmount"
            class="block text-xs"
          >máx. {{ formatMoney(row.original.maxDiscountAmount) }}</span>
        </template>

        <template #conditions-cell="{ row }">
          <span class="grid min-w-28 gap-0.5 text-xs">
            <span v-if="row.original.minOrderAmount">Desde {{ formatMoney(row.original.minOrderAmount) }}</span>
            <span v-if="row.original.firstPurchaseOnly">Primera compra</span>
            <span v-if="!row.original.minOrderAmount && !row.original.firstPurchaseOnly">Sin condiciones</span>
          </span>
        </template>

        <template #uses-cell="{ row }">
          <span class="tabular-nums text-highlighted">{{ row.original.usedCount }}</span>
          <span class="tabular-nums"> / {{ row.original.maxUses ?? '∞' }}</span>
        </template>

        <template #expiresAt-cell="{ row }">
          <span class="tabular-nums">{{ row.original.expiresAt ? formatDateTime(row.original.expiresAt) : 'No vence' }}</span>
        </template>

        <template #status-cell="{ row }">
          <CouponStatusBadge :coupon="row.original" />
        </template>

        <template #actions-cell="{ row }">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            :icon="row.original.active ? 'ph:toggle-right-fill' : 'ph:toggle-left'"
            :loading="togglingId === row.original.id"
            :aria-label="row.original.active ? `Desactivar ${row.original.code}` : `Activar ${row.original.code}`"
            :title="row.original.active ? 'Desactivar' : 'Activar'"
            :class="row.original.active && 'text-primary'"
            @click.stop="onToggle(row.original)"
          />
        </template>
      </UTable>

      <p
        v-if="store.loaded && store.items.length"
        class="text-sm text-muted"
      >
        {{ store.filtered.length }} de {{ store.items.length }} {{ store.items.length === 1 ? 'cupón' : 'cupones' }}
      </p>
    </div>
  </UCard>
</template>
