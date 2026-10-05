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

const search = useSearchTerm(() => store.search, (value) => {
  store.search = value
})

onMounted(() => store.load())
</script>

<template>
  <UCard>
    <div class="grid gap-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <UInput
          v-model="search"
          type="search"
          icon="ph:magnifying-glass"
          placeholder="Buscar colección"
          aria-label="Buscar colección"
          class="flex-1"
        />
        <p class="text-sm text-muted sm:max-w-64">
          {{ searching ? 'Limpia la búsqueda para reordenar.' : 'Arrastra para cambiar el orden en la tienda.' }}
        </p>
      </div>

      <UAlert
        v-if="actionError || store.error"
        color="error"
        icon="ph:warning-circle"
        :title="actionError ?? store.error ?? undefined"
        :actions="store.error ? retryAction(() => store.load()) : undefined"
        orientation="horizontal"
      />

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
          <USkeleton
            class="h-12 w-24 shrink-0"
          />
          <div class="grid flex-1 gap-2">
            <USkeleton
              class="h-4 w-40"
            />
            <USkeleton
              class="h-3 w-28"
            />
          </div>
          <USkeleton
            class="h-6 w-16"
          />
        </div>
      </div>

      <UEmpty
        v-else-if="store.loaded && !rows.length"
        icon="ph:stack"
        :title="searching ? 'Sin resultados' : 'Aún no hay colecciones'"
        :description="searching ? 'Ninguna colección coincide con la búsqueda.' : 'Agrupa artículos para el escaparate: Verano 2026, Básicos, Lo más vendido.'"
      >
        <template #actions>
          <UButton
            v-if="!searching"
            size="sm"
            icon="ph:plus"
            :to="COLLECTION_ROUTES.create"
            label="Nueva colección"
          />
      
        </template>
      </UEmpty>

      <ol
        v-else-if="rows.length"
        class="-mx-4 divide-y divide-default border-y border-default transition-opacity sm:-mx-6"
        :class="saving && 'opacity-60'"
        :aria-busy="saving || undefined"
        aria-label="Colecciones en orden de tienda"
      >
        <li
          v-for="(collection, index) in rows"
          :key="collection.id"
          class="flex items-center gap-3 px-4 py-3 transition-colors sm:px-6"
          :class="dragging === collection.id ? 'bg-primary/5' : 'hover:bg-muted'"
          :draggable="!searching && !saving"
          @dragstart="onDragStart(collection, $event)"
          @dragover.prevent="onDragOver(collection)"
          @dragend="onDragEnd"
          @drop.prevent
        >
          <UIcon
            v-if="!searching"
            name="ph:dots-six-vertical"
            class="size-5 shrink-0 cursor-grab text-muted active:cursor-grabbing"
            aria-hidden="true"
          />
          <img
            v-if="collection.imageUrl"
            :src="collection.imageUrl"
            alt=""
            loading="lazy"
            class="aspect-[16/9] w-20 shrink-0 rounded-lg border border-default object-cover"
            draggable="false"
          >
          <span
            v-else
            class="grid aspect-[16/9] w-20 shrink-0 place-items-center rounded-lg bg-muted text-muted"
          >
            <UIcon
              name="ph:image"
              class="size-4"
              aria-hidden="true"
            />
          </span>

          <span class="grid min-w-0 flex-1 gap-0.5">
            <NuxtLink
              :to="COLLECTION_ROUTES.detail(collection.id)"
              class="justify-self-start truncate rounded-md font-medium text-highlighted hover:underline focus-visible:outline-2 focus-visible:outline-primary"
              draggable="false"
            >{{ collection.name }}</NuxtLink>
            <span class="truncate font-mono text-xs text-muted">{{ STORE_COLLECTION_PATH }}/{{ collection.slug }}</span>
          </span>

          <span class="hidden whitespace-nowrap text-sm tabular-nums text-muted sm:block">
            {{ collection.productCount }} {{ collection.productCount === 1 ? 'artículo' : 'artículos' }}
          </span>
          <UBadge
            :color="collection.active ? 'success' : 'neutral'"
            :label="collection.active ? 'Visible' : 'Oculta'"
            class="shrink-0"
          />

          <span
            v-if="!searching"
            class="flex shrink-0 gap-0.5"
          >
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="ph:arrow-up"
              :disabled="index === 0 || saving"
              :aria-label="`Subir ${collection.name}`"
              @click="move(collection as Collection, -1)"
            />
            <UButton
              color="neutral"
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
  </UCard>
</template>
