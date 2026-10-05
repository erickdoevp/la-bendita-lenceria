<script setup lang="ts">
import { ORDER_ROUTES } from '~/features/orders'
import type { CouponUsage } from '../types'

defineProps<{
  page: Page<CouponUsage> | null
  pending: boolean
  error: string | null
}>()
const emit = defineEmits<{ change: [page: number], retry: [] }>()
</script>

<template>
  <UiPanel
    title="Usos"
    description="Quién lo usó y en qué orden. Si una orden se canceló sin pagar, su uso se devolvió y no aparece."
  >
    <div class="grid gap-5">
      <UiAlert v-if="error">
        {{ error }}
        <button
          type="button"
          class="ml-1 font-medium underline underline-offset-2"
          @click="emit('retry')"
        >
          Reintentar
        </button>
      </UiAlert>

      <div
        v-else-if="pending && !page"
        class="grid gap-3"
        role="status"
        aria-label="Cargando usos"
      >
        <UiSkeleton
          v-for="row in 3"
          :key="row"
          class="h-5"
        />
      </div>

      <p
        v-else-if="page && !page.items.length"
        class="text-sm text-ink-muted"
      >
        Nadie lo ha usado todavía.
      </p>

      <div
        v-else-if="page"
        class="-mx-5 overflow-x-auto sm:-mx-6"
      >
        <table class="w-full text-left text-sm">
          <thead class="text-ink-muted">
            <tr>
              <th class="px-5 pb-3 font-medium sm:px-6">
                Fecha
              </th>
              <th class="pb-3 pr-4 font-medium">
                Clienta
              </th>
              <th class="px-5 pb-3 text-right font-medium sm:px-6">
                Orden
              </th>
            </tr>
          </thead>
          <tbody
            class="divide-y divide-line border-t border-line transition-opacity"
            :class="pending && 'opacity-60'"
          >
            <tr
              v-for="usage in page.items"
              :key="usage.id"
            >
              <td class="whitespace-nowrap px-5 py-3 tabular-nums text-ink-muted sm:px-6">
                {{ formatDateTime(usage.usedAt) }}
              </td>
              <td class="py-3 pr-4 text-ink">
                {{ usage.username }}
              </td>
              <td class="px-5 py-3 text-right sm:px-6">
                <NuxtLink
                  :to="ORDER_ROUTES.detail(usage.orderId)"
                  class="inline-flex items-center gap-1 font-mono text-accent hover:underline"
                  :title="`Ver la orden ${usage.orderId}`"
                >
                  <Icon
                    name="ph:receipt"
                    class="size-3.5"
                    aria-hidden="true"
                  />
                  #{{ usage.orderId.slice(0, 8) }}
                </NuxtLink>
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
        :disabled="pending"
        @change="emit('change', $event)"
      />
    </div>
  </UiPanel>
</template>
