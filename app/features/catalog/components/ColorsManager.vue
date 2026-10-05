<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useColorsStore } from '../stores/colors.store'
import type { Color } from '../types'
import CatalogRowActions from './CatalogRowActions.vue'
import CatalogTableSkeleton from './CatalogTableSkeleton.vue'
import ColorForm from './ColorForm.vue'
import ColorSwatch from './ColorSwatch.vue'
import { useEditModal } from '../utils/edit-modal'

const store = useColorsStore()
const { editing, open: editOpen } = useEditModal<Color>()
const deletingId = ref<string | null>(null)
const actionError = ref<string | null>(null)

const page = computed(() => store.list.data)
const items = computed(() => page.value?.items ?? [])

const search = useSearchTerm(() => store.list.filters.name, (value) => {
  store.list.filters.name = value
})

const columns: TableColumn<Color>[] = [
  { accessorKey: 'name', header: 'Color' },
  { accessorKey: 'hex', header: 'Hex' },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, 'Acciones'), meta: { class: { td: 'w-px py-2' } } },
]

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
    <UCard>
      <div class="grid gap-5">
        <UInput
          v-model="search"
          type="search"
          icon="ph:magnifying-glass"
          placeholder="Buscar color"
          aria-label="Buscar color"
        />

        <UAlert
          v-if="actionError || store.list.error"
          color="error"
          icon="ph:warning-circle"
          :title="actionError ?? store.list.error ?? undefined"
          :actions="store.list.error ? retryAction(() => store.list.load()) : undefined"
          orientation="horizontal"
        />

        <CatalogTableSkeleton v-if="store.list.pending && !page" />

        <UEmpty
          v-else-if="page && !items.length"
          icon="ph:palette"
          :title="store.list.filters.name ? 'Sin resultados' : 'Aún no hay colores'"
          :description="store.list.filters.name ? 'Prueba con otro nombre.' : 'Crea los colores de tus prendas para poder armar variantes.'"
        />

        <UTable
          v-else-if="items.length"
          :data="items"
          :columns="columns"
          :class="['-mx-4 sm:-mx-6 transition-opacity', store.list.pending && 'opacity-60']"
        >
          <template #name-cell="{ row }">
            <span class="flex items-center gap-3 font-medium text-highlighted">
              <ColorSwatch :hex="row.original.hex" />
              {{ row.original.name }}
            </span>
          </template>
          <template #hex-cell="{ row }">
            <span class="font-mono">{{ row.original.hex }}</span>
          </template>
          <template #actions-cell="{ row }">
            <CatalogRowActions
              :name="row.original.name"
              :deleting="deletingId === row.original.id"
              @edit="editing = row.original"
              @delete="onDelete(row.original)"
            />
          </template>
        </UTable>

        <PagePagination
          v-if="page"
          :page="page"
          :disabled="store.list.pending"
          @change="store.list.load"
        />
      </div>
    </UCard>

    <UCard
      class="lg:sticky lg:top-6"
      title="Nuevo color"
      description="El hex pinta la muestra que ve la clienta en la tienda."
    >
      <ColorForm />
    </UCard>

    <UModal
      v-model:open="editOpen"
      :title="`Editar color ${editing?.name ?? ''}`"
    >
      <template #body>
        <ColorForm
          :color="editing"
          @saved="editing = null"
          @cancel="editing = null"
        />
    
      </template>
    </UModal>
  </div>
</template>
