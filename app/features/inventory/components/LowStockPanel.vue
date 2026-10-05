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
  <UiPanel
    v-if="store.items.length || store.error"
    title="Alertas de stock"
    description="Variantes con lo disponible en su umbral de alerta o por debajo. Las agotadas van primero."
  >
    <template #actions>
      <p class="flex gap-2 text-xs font-medium">
        <span
          v-if="store.outOfStock.length"
          class="rounded-lg bg-danger-soft px-2 py-1 text-danger"
        >{{ store.outOfStock.length }} agotada(s)</span>
        <span
          v-if="store.runningLow.length"
          class="rounded-lg bg-warning-soft px-2 py-1 text-warning"
        >{{ store.runningLow.length }} por agotarse</span>
      </p>
    </template>

    <UiAlert v-if="store.error">
      {{ store.error }}
      <button
        type="button"
        class="ml-1 font-medium underline underline-offset-2"
        @click="store.load()"
      >
        Reintentar
      </button>
    </UiAlert>

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
            class="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2.5 transition-colors duration-200 hover:border-ink-muted focus-visible:outline-2 focus-visible:outline-accent"
          >
            <span class="grid min-w-0">
              <span class="truncate font-mono text-sm text-ink">{{ item.variantSku }}</span>
              <span class="text-xs text-ink-muted">Alerta en {{ item.lowStockThreshold }}</span>
            </span>
            <span
              class="shrink-0 text-right text-sm font-semibold tabular-nums"
              :class="item.availableStock <= 0 ? 'text-danger' : 'text-warning'"
            >
              {{ item.availableStock <= 0 ? 'Agotado' : `${item.availableStock} disp.` }}
            </span>
          </NuxtLink>
        </li>
      </ul>
      <UiButton
        v-if="store.items.length > PREVIEW"
        variant="ghost"
        size="sm"
        class="justify-self-start"
        :icon="expanded ? 'ph:caret-up' : 'ph:caret-down'"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Ver menos' : `Ver las ${store.items.length}` }}
      </UiButton>
    </div>
  </UiPanel>
</template>
