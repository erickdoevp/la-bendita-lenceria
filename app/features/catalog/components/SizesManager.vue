<script setup lang="ts">
import { useSizesStore } from '../stores/sizes.store'
import type { Size } from '../types'
import { useEditModal } from '../utils/edit-modal'
import CatalogRowActions from './CatalogRowActions.vue'
import CatalogTableSkeleton from './CatalogTableSkeleton.vue'
import SizeForm from './SizeForm.vue'

const store = useSizesStore()
const { editing, open: editOpen } = useEditModal<Size>()
const deletingId = ref<string | null>(null)
const actionError = ref<string | null>(null)

const page = computed(() => store.list.data)
const items = computed(() => page.value?.items ?? [])

onMounted(() => {
  store.fetchAll()
  store.list.load()
})

watch(() => store.list.filters.name, () => store.list.load(0))

async function onDelete(size: Size) {
  deletingId.value = size.id
  actionError.value = null
  try {
    await store.remove(size.id)
  }
  catch (error) {
    actionError.value = parseApiError(error, {
      conflict: `No se puede eliminar ${size.name}: hay variantes que la usan.`,
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
          id="sizes-search"
          v-model="store.list.filters.name"
          label="Buscar talla"
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
          icon="ph:ruler"
          :title="store.list.filters.name ? 'Sin resultados' : 'Aún no hay tallas'"
          :description="store.list.filters.name ? 'Prueba con otro nombre.' : 'Crea las tallas que manejas (XS, S, M...) para poder armar variantes.'"
        />

        <div
          v-else-if="items.length"
          class="-mx-5 overflow-x-auto sm:-mx-6"
        >
          <table class="w-full text-left text-sm">
            <thead class="text-ink-muted">
              <tr>
                <th class="w-20 px-5 pb-3 font-medium sm:px-6">
                  Orden
                </th>
                <th class="pb-3 font-medium">
                  Nombre
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
                v-for="size in items"
                :key="size.id"
              >
                <td class="px-5 py-3 tabular-nums text-ink-muted sm:px-6">
                  {{ size.sortOrder }}
                </td>
                <td class="py-3 font-medium text-ink">
                  {{ size.name }}
                </td>
                <td class="px-5 py-2 sm:px-6">
                  <CatalogRowActions
                    :name="size.name"
                    :deleting="deletingId === size.id"
                    @edit="editing = size"
                    @delete="onDelete(size)"
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
      title="Nueva talla"
      description="El orden define cómo se muestran en la tienda (XS = 1, S = 2...)."
    >
      <SizeForm />
    </UiPanel>

    <UiModal
      v-model:open="editOpen"
      :title="`Editar talla ${editing?.name ?? ''}`"
    >
      <SizeForm
        :size="editing"
        @saved="editing = null"
        @cancel="editing = null"
      />
    </UiModal>
  </div>
</template>
