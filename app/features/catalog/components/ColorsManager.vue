<script setup lang="ts">
import { useColorsStore } from '../stores/colors.store'
import type { Color } from '../types'
import CatalogRowActions from './CatalogRowActions.vue'
import CatalogTableSkeleton from './CatalogTableSkeleton.vue'
import ColorForm from './ColorForm.vue'
import ColorSwatch from './ColorSwatch.vue'

const store = useColorsStore()
const editing = ref<Color | null>(null)
const deletingId = ref<string | null>(null)
const actionError = ref<string | null>(null)

const page = computed(() => store.list.data)
const items = computed(() => page.value?.items ?? [])

onMounted(() => {
  store.fetchAll()
  store.list.load()
})

watch(() => store.list.filters.name, () => store.list.load(0))

async function onDelete(color: Color) {
  deletingId.value = color.id
  actionError.value = null
  try {
    await store.remove(color.id)
    if (editing.value?.id === color.id) editing.value = null
  }
  catch (error) {
    actionError.value = parseApiError(error, {
      conflict: `No se puede eliminar ${color.name}: hay variantes o imágenes que lo usan.`,
    }).message
  }
  finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
    <UiPanel>
      <div class="grid gap-5">
        <UiSearch
          id="colors-search"
          v-model="store.list.filters.name"
          label="Buscar color"
        />

        <UiAlert v-if="actionError || store.list.error">
          {{ actionError ?? store.list.error }}
          <button
            v-if="store.list.error"
            type="button"
            class="ml-1 font-medium underline underline-offset-2"
            @click="store.list.load()"
          >
            Reintentar
          </button>
        </UiAlert>

        <CatalogTableSkeleton v-if="store.list.pending && !page" />

        <UiEmptyState
          v-else-if="page && !items.length"
          icon="ph:palette"
          :title="store.list.filters.name ? 'Sin resultados' : 'Aún no hay colores'"
          :description="store.list.filters.name ? 'Prueba con otro nombre.' : 'Crea los colores de tus prendas para poder armar variantes.'"
        />

        <div
          v-else-if="items.length"
          class="-mx-5 overflow-x-auto sm:-mx-6"
        >
          <table class="w-full text-left text-sm">
            <thead class="text-ink-muted">
              <tr>
                <th class="px-5 pb-3 font-medium sm:px-6">
                  Color
                </th>
                <th class="pb-3 font-medium">
                  Hex
                </th>
                <th class="px-5 pb-3 sm:px-6">
                  <span class="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody
              class="divide-y divide-line border-t border-line transition-opacity"
              :class="store.list.pending && 'opacity-60'"
            >
              <tr
                v-for="color in items"
                :key="color.id"
                :class="editing?.id === color.id && 'bg-accent/5'"
              >
                <td class="px-5 py-3 sm:px-6">
                  <span class="flex items-center gap-3 font-medium text-ink">
                    <ColorSwatch :hex="color.hex" />
                    {{ color.name }}
                  </span>
                </td>
                <td class="py-3 font-mono text-[13px] text-ink-muted">
                  {{ color.hex }}
                </td>
                <td class="px-5 py-2 sm:px-6">
                  <CatalogRowActions
                    :name="color.name"
                    :deleting="deletingId === color.id"
                    @edit="editing = color"
                    @delete="onDelete(color)"
                  />
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

    <UiPanel
      class="lg:sticky lg:top-6"
      :title="editing ? `Editar ${editing.name}` : 'Nuevo color'"
      description="El hex pinta la muestra que ve la clienta en la tienda."
    >
      <ColorForm
        :color="editing"
        @saved="editing = null"
        @cancel="editing = null"
      />
    </UiPanel>
  </div>
</template>
