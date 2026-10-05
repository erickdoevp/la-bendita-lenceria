<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
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

const search = useSearchTerm(() => store.list.filters.name, (value) => {
  store.list.filters.name = value
})

const columns: TableColumn<Size>[] = [
  { accessorKey: 'sortOrder', header: 'Orden', meta: { class: { th: 'w-20' } } },
  { accessorKey: 'name', header: 'Nombre' },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, 'Acciones'), meta: { class: { td: 'w-px py-2' } } },
]

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
    <UCard>
      <div class="grid gap-5">
        <UInput
          v-model="search"
          type="search"
          icon="ph:magnifying-glass"
          placeholder="Buscar talla"
          aria-label="Buscar talla"
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
          icon="ph:ruler"
          :title="store.list.filters.name ? 'Sin resultados' : 'Aún no hay tallas'"
          :description="store.list.filters.name ? 'Prueba con otro nombre.' : 'Crea las tallas que manejas (XS, S, M...) para poder armar variantes.'"
        />

        <UTable
          v-else-if="items.length"
          :data="items"
          :columns="columns"
          :class="['-mx-4 sm:-mx-6 transition-opacity', store.list.pending && 'opacity-60']"
        >
          <template #sortOrder-cell="{ row }">
            <span class="tabular-nums">{{ row.original.sortOrder }}</span>
          </template>
          <template #name-cell="{ row }">
            <span class="font-medium text-highlighted">{{ row.original.name }}</span>
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
      title="Nueva talla"
      description="El orden define cómo se muestran en la tienda (XS = 1, S = 2...)."
    >
      <SizeForm />
    </UCard>

    <UModal
      v-model:open="editOpen"
      :title="`Editar talla ${editing?.name ?? ''}`"
    >
      <template #body>
        <SizeForm
          :size="editing"
          @saved="editing = null"
          @cancel="editing = null"
        />
    
      </template>
    </UModal>
  </div>
</template>
