<script setup lang="ts">
import { useDragReorder } from '../composables/useDragReorder'
import { COLLECTION_ROUTES, STORE_COLLECTION_PATH } from '../constants'
import { useCollectionsStore } from '../stores/collections.store'
import type { Collection } from '../types'

const store = useCollectionsStore()
const actionError = ref<string | null>(null)

// Reordenar manda la lista completa: con un filtro activo no se puede arrastrar
const searching = computed(() => Boolean(store.search.trim()))

const { items: ordered, dragging, saving, onDragStart, onDragOver, onDragEnd, move } = useDragReorder(
  () => store.items,
  c => c.id,
  async (list) => {
    actionError.value = null
    try {
      await store.reorder(list)
    }
    catch (error) {
      actionError.value = parseApiError(error).message
    }
  },
)

const rows = computed(() => (searching.value ? store.filtered : ordered.value))

onMounted(() => store.load())
</script>

<template>
  <UiPanel>
    <div class="grid gap-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <UiSearch
          id="collections-search"
          v-model="store.search"
          label="Buscar colección"
        />
        <p class="text-[13px] text-ink-muted sm:max-w-64">
          {{ searching ? 'Limpia la búsqueda para reordenar.' : 'Arrastra para cambiar el orden en la tienda.' }}
        </p>
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
        class="grid gap-3"
        role="status"
        aria-label="Cargando colecciones"
      >
        <div
          v-for="row in 4"
          :key="row"
          class="flex items-center gap-4"
        >
          <UiSkeleton class="h-12 w-24 shrink-0" />
          <div class="grid flex-1 gap-2">
            <UiSkeleton class="h-4 w-40" />
            <UiSkeleton class="h-3 w-28" />
          </div>
          <UiSkeleton class="h-6 w-16" />
        </div>
      </div>

      <UiEmptyState
        v-else-if="store.loaded && !rows.length"
        icon="ph:stack"
        :title="searching ? 'Sin resultados' : 'Aún no hay colecciones'"
        :description="searching ? 'Ninguna colección coincide con la búsqueda.' : 'Agrupa artículos para el escaparate: Verano 2026, Básicos, Lo más vendido.'"
      >
        <UiButton
          v-if="!searching"
          size="sm"
          icon="ph:plus"
          :to="COLLECTION_ROUTES.create"
        >
          Nueva colección
        </UiButton>
      </UiEmptyState>

      <ol
        v-else-if="rows.length"
        class="-mx-5 divide-y divide-line border-y border-line transition-opacity sm:-mx-6"
        :class="saving && 'opacity-60'"
        :aria-busy="saving || undefined"
        aria-label="Colecciones en orden de tienda"
      >
        <li
          v-for="(collection, index) in rows"
          :key="collection.id"
          class="flex items-center gap-3 px-5 py-3 transition-colors sm:px-6"
          :class="dragging === collection.id ? 'bg-accent/5' : 'hover:bg-surface'"
          :draggable="!searching && !saving"
          @dragstart="onDragStart(collection, $event)"
          @dragover.prevent="onDragOver(collection)"
          @dragend="onDragEnd"
          @drop.prevent
        >
          <Icon
            v-if="!searching"
            name="ph:dots-six-vertical"
            class="size-5 shrink-0 cursor-grab text-ink-muted active:cursor-grabbing"
            aria-hidden="true"
          />
          <img
            v-if="collection.imageUrl"
            :src="collection.imageUrl"
            alt=""
            loading="lazy"
            class="aspect-[16/9] w-20 shrink-0 rounded-lg border border-line object-cover"
            draggable="false"
          >
          <span
            v-else
            class="grid aspect-[16/9] w-20 shrink-0 place-items-center rounded-lg bg-surface text-ink-muted"
          >
            <Icon
              name="ph:image"
              class="size-4"
              aria-hidden="true"
            />
          </span>

          <span class="grid min-w-0 flex-1 gap-0.5">
            <NuxtLink
              :to="COLLECTION_ROUTES.detail(collection.id)"
              class="justify-self-start truncate rounded-md font-medium text-ink hover:underline focus-visible:outline-2 focus-visible:outline-accent"
              draggable="false"
            >{{ collection.name }}</NuxtLink>
            <span class="truncate font-mono text-xs text-ink-muted">{{ STORE_COLLECTION_PATH }}/{{ collection.slug }}</span>
          </span>

          <span class="hidden whitespace-nowrap text-sm tabular-nums text-ink-muted sm:block">
            {{ collection.productCount }} {{ collection.productCount === 1 ? 'artículo' : 'artículos' }}
          </span>
          <span
            class="inline-flex shrink-0 rounded-lg px-2 py-1 text-xs font-medium"
            :class="collection.active ? 'bg-success-soft text-success' : 'bg-surface text-ink-muted'"
          >{{ collection.active ? 'Visible' : 'Oculta' }}</span>

          <span
            v-if="!searching"
            class="flex shrink-0 gap-0.5"
          >
            <UiButton
              variant="ghost"
              size="sm"
              icon="ph:arrow-up"
              :disabled="index === 0 || saving"
              :aria-label="`Subir ${collection.name}`"
              @click="move(collection as Collection, -1)"
            />
            <UiButton
              variant="ghost"
              size="sm"
              icon="ph:arrow-down"
              :disabled="index === rows.length - 1 || saving"
              :aria-label="`Bajar ${collection.name}`"
              @click="move(collection as Collection, 1)"
            />
          </span>
        </li>
      </ol>
    </div>
  </UiPanel>
</template>
