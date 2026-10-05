<script setup lang="ts">
import { COUPON_ROUTES, COUPON_STATUS_FILTERS } from '../constants'
import { useCouponsStore } from '../stores/coupons.store'
import type { Coupon } from '../types'
import { formatCouponValue } from '../utils/coupon'
import CouponStatusBadge from './CouponStatusBadge.vue'

const store = useCouponsStore()
const togglingId = ref<string | null>(null)
const actionError = ref<string | null>(null)

const filtering = computed(() => Boolean(store.filters.code || store.filters.status))

onMounted(() => store.load())

function clearFilters() {
  Object.assign(store.filters, { code: '', status: '' })
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
  <UiPanel>
    <div class="grid gap-5">
      <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <UiSearch
          id="coupons-search"
          v-model="store.filters.code"
          label="Buscar por código o descripción"
        />
        <div>
          <label
            for="coupons-status"
            class="sr-only"
          >Estado</label>
          <UiSelect
            id="coupons-status"
            v-model="store.filters.status"
            class="[&_select]:h-10 [&_select]:text-sm"
          >
            <option
              v-for="option in COUPON_STATUS_FILTERS"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </UiSelect>
        </div>
      </div>

      <UiAlert v-if="actionError || store.error">
        {{ actionError ?? store.error }}
        <button
          v-if="store.error"
          type="button"
          class="ml-1 font-medium underline underline-offset-2"
          @click="store.load()"
        >
          Reintentar
        </button>
      </UiAlert>

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
            <UiSkeleton class="h-4 w-32" />
            <UiSkeleton class="h-3 w-48" />
          </div>
          <UiSkeleton class="hidden h-4 w-20 sm:block" />
          <UiSkeleton class="h-4 w-14" />
          <UiSkeleton class="h-6 w-16" />
        </div>
      </div>

      <UiEmptyState
        v-else-if="store.loaded && !store.filtered.length"
        icon="ph:ticket"
        :title="filtering ? 'Sin resultados' : 'Aún no hay cupones'"
        :description="filtering ? 'Ningún cupón coincide con estos filtros.' : 'Crea un código de descuento para tus clientas.'"
      >
        <UiButton
          v-if="filtering"
          variant="secondary"
          size="sm"
          icon="ph:x"
          @click="clearFilters"
        >
          Limpiar filtros
        </UiButton>
        <UiButton
          v-else
          size="sm"
          icon="ph:plus"
          :to="COUPON_ROUTES.create"
        >
          Nuevo cupón
        </UiButton>
      </UiEmptyState>

      <div
        v-else-if="store.filtered.length"
        class="-mx-5 overflow-x-auto sm:-mx-6"
      >
        <table class="w-full text-left text-sm">
          <thead class="text-ink-muted">
            <tr>
              <th class="px-5 pb-3 font-medium sm:px-6">
                Código
              </th>
              <th class="pb-3 pr-4 font-medium">
                Descuento
              </th>
              <th class="pb-3 pr-4 font-medium">
                Condiciones
              </th>
              <th class="pb-3 pr-4 text-right font-medium">
                Usos
              </th>
              <th class="pb-3 pr-4 font-medium">
                Vence
              </th>
              <th class="pb-3 pr-4 font-medium">
                Estado
              </th>
              <th class="px-5 pb-3 sm:px-6">
                <span class="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody
            class="divide-y divide-line border-t border-line transition-opacity"
            :class="store.pending && 'opacity-60'"
          >
            <tr
              v-for="coupon in store.filtered"
              :key="coupon.id"
              class="cursor-pointer transition-colors hover:bg-surface"
              @click="navigateTo(COUPON_ROUTES.detail(coupon.id))"
            >
              <td class="px-5 py-3 sm:px-6">
                <span class="grid min-w-40 gap-0.5">
                  <NuxtLink
                    :to="COUPON_ROUTES.detail(coupon.id)"
                    class="justify-self-start rounded-md font-mono font-semibold tracking-wide text-ink hover:underline focus-visible:outline-2 focus-visible:outline-accent"
                    @click.stop
                  >{{ coupon.code }}</NuxtLink>
                  <span
                    v-if="coupon.description"
                    class="line-clamp-1 text-xs text-ink-muted"
                  >{{ coupon.description }}</span>
                </span>
              </td>
              <td class="whitespace-nowrap py-3 pr-4">
                <span class="font-medium tabular-nums text-ink">{{ formatCouponValue(coupon) }}</span>
                <span
                  v-if="coupon.valueType === 'PERCENTAGE' && coupon.maxDiscountAmount"
                  class="block text-xs text-ink-muted"
                >máx. {{ formatMoney(coupon.maxDiscountAmount) }}</span>
              </td>
              <td class="py-3 pr-4 text-xs text-ink-muted">
                <span class="grid min-w-28 gap-0.5">
                  <span v-if="coupon.minOrderAmount">Desde {{ formatMoney(coupon.minOrderAmount) }}</span>
                  <span v-if="coupon.firstPurchaseOnly">Primera compra</span>
                  <span v-if="!coupon.minOrderAmount && !coupon.firstPurchaseOnly">Sin condiciones</span>
                </span>
              </td>
              <td class="whitespace-nowrap py-3 pr-4 text-right tabular-nums text-ink">
                {{ coupon.usedCount }}<span class="text-ink-muted"> / {{ coupon.maxUses ?? '∞' }}</span>
              </td>
              <td class="whitespace-nowrap py-3 pr-4 tabular-nums text-ink-muted">
                {{ coupon.expiresAt ? formatDateTime(coupon.expiresAt) : 'No vence' }}
              </td>
              <td class="py-3 pr-4">
                <CouponStatusBadge :coupon="coupon" />
              </td>
              <td class="px-5 py-2 text-right sm:px-6">
                <UiButton
                  variant="ghost"
                  size="sm"
                  :icon="coupon.active ? 'ph:toggle-right-fill' : 'ph:toggle-left'"
                  :loading="togglingId === coupon.id"
                  :aria-label="coupon.active ? `Desactivar ${coupon.code}` : `Activar ${coupon.code}`"
                  :title="coupon.active ? 'Desactivar' : 'Activar'"
                  :class="coupon.active && 'text-accent'"
                  @click.stop="onToggle(coupon)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p
        v-if="store.loaded && store.items.length"
        class="text-sm text-ink-muted"
      >
        {{ store.filtered.length }} de {{ store.items.length }} {{ store.items.length === 1 ? 'cupón' : 'cupones' }}
      </p>
    </div>
  </UiPanel>
</template>
