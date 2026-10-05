<script setup lang="ts">
import { INVENTORY_ROUTES } from '../constants'
import { useLowStockStore } from '../stores/low-stock.store'

const store = useLowStockStore()
const expanded = ref(false)
const PREVIEW = 6

const visible = computed(() => (expanded.value ? store.items : store.items.slice(0, PREVIEW)))

onMounted(() => store.load())
</script>

<template>
  <UCard
    v-if="store.items.length || store.error"
  >
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="grid gap-1">
          <h2 class="font-semibold tracking-tight text-highlighted">
            Alertas de stock
          </h2>
          <p class="max-w-[65ch] text-sm leading-relaxed text-muted">
            Variantes con lo disponible en su umbral de alerta o por debajo. Las agotadas van primero.
          </p>
        </div>
          <p class="flex gap-2">
            <UBadge
              v-if="store.outOfStock.length"
              color="error"
              :label="`${store.outOfStock.length} agotada(s)`"
            />
            <UBadge
              v-if="store.runningLow.length"
              color="warning"
              :label="`${store.runningLow.length} por agotarse`"
            />
          </p>
      </div>
    </template>

    <UAlert
      v-if="store.error"
      color="error"
      icon="ph:warning-circle"
      :title="store.error"
      :actions="retryAction(() => store.load())"
      orientation="horizontal"
    />

    <div
      v-else
      class="grid gap-3"
    >
      <ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="item in visible"
          :key="item.id"
        >
          <NuxtLink
            :to="INVENTORY_ROUTES.variant(item.variantId)"
            class="flex items-center justify-between gap-3 rounded-lg border border-default px-3 py-2.5 transition-colors duration-200 hover:border-accented focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span class="grid min-w-0">
              <span class="truncate font-mono text-sm text-highlighted">{{ item.variantSku }}</span>
              <span class="text-xs text-muted">Alerta en {{ item.lowStockThreshold }}</span>
            </span>
            <span
              class="shrink-0 text-right text-sm font-semibold tabular-nums"
              :class="item.availableStock <= 0 ? 'text-error' : 'text-warning'"
            >
              {{ item.availableStock <= 0 ? 'Agotado' : `${item.availableStock} disp.` }}
            </span>
          </NuxtLink>
        </li>
      </ul>
      <UButton
        v-if="store.items.length > PREVIEW"
        color="neutral"
        variant="ghost"
        size="sm"
        class="justify-self-start"
        :icon="expanded ? 'ph:caret-up' : 'ph:caret-down'"
        :aria-expanded="expanded"
        :label="expanded ? 'Ver menos' : `Ver las ${store.items.length}`"
        @click="expanded = !expanded"
      />
    </div>
  </UCard>
</template>
