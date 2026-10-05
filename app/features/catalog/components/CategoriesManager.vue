<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useCategoriesStore } from '../stores/categories.store'
import type { Category } from '../types'
import { useEditModal } from '../utils/edit-modal'
import CatalogRowActions from './CatalogRowActions.vue'
import CatalogTableSkeleton from './CatalogTableSkeleton.vue'
import CategoryForm from './CategoryForm.vue'

const store = useCategoriesStore()
const { editing, open: editOpen } = useEditModal<Category>()
const page = computed(() => store.list.data)
const items = computed(() => page.value?.items ?? [])
const filtered = computed(() => Boolean(store.list.filters.name || store.list.filters.active))

const search = useSearchTerm(() => store.list.filters.name, (value) => {
  store.list.filters.name = value
})
const active = useSelectAll(store.list.filters, 'active')
const activeItems = [
  { label: 'Todas', value: SELECT_ALL },
  { label: 'Activas', value: 'true' },
  { label: 'Inactivas', value: 'false' },
]

const columns: TableColumn<Category>[] = [
  { accessorKey: 'name', header: 'Categoría' },
  { id: 'parent', header: 'Padre' },
  { accessorKey: 'active', header: 'Estado', meta: { class: { th: 'text-right', td: 'text-right' } } },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, 'Acciones'), meta: { class: { td: 'w-px py-2' } } },
]

onMounted(() => store.list.load())

watch(() => [store.list.filters.name, store.list.filters.active], () => store.list.load(0))
</script>

<template>
  <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
    <UCard>
      <div class="grid gap-5">
        <div class="flex flex-col gap-3 sm:flex-row">
          <UInput
            v-model="search"
            type="search"
            icon="ph:magnifying-glass"
            placeholder="Buscar categoría"
            aria-label="Buscar categoría"
            class="flex-1"
          />
          <USelect
            v-model="active"
            :items="activeItems"
            aria-label="Estado"
            class="sm:w-40"
          />
        </div>

        <UAlert
          v-if="store.list.error"
          color="error"
          icon="ph:warning-circle"
          :title="store.list.error"
          :actions="retryAction(store.list.load)"
          orientation="horizontal"
        />

        <CatalogTableSkeleton v-if="store.list.pending && !page" />

        <UEmpty
          v-else-if="page && !items.length"
          icon="ph:tree-structure"
          :title="filtered ? 'Sin resultados' : 'Aún no hay categorías'"
          :description="filtered ? 'Prueba con otros filtros.' : 'Todo artículo necesita una categoría. Crea la primera con el formulario.'"
        />

        <UTable
          v-else-if="items.length"
          :data="items"
          :columns="columns"
          :class="['-mx-4 sm:-mx-6 transition-opacity', store.list.pending && 'opacity-60']"
        >
          <template #name-cell="{ row }">
            <div class="flex items-center gap-3">
              <img
                v-if="row.original.imageUrl"
                :src="row.original.imageUrl"
                alt=""
                loading="lazy"
                class="size-10 shrink-0 rounded-lg border border-default object-cover"
              >
              <span
                v-else
                class="grid size-10 shrink-0 place-items-center rounded-lg bg-elevated text-muted"
              >
                <UIcon
                  name="ph:image"
                  class="size-4"
                />
              </span>
              <span class="grid min-w-0">
                <span class="truncate font-medium text-highlighted">{{ row.original.name }}</span>
                <span class="truncate font-mono text-xs">{{ row.original.slug }}</span>
              </span>
            </div>
          </template>
          <template #parent-cell="{ row }">
            {{ row.original.parent?.name ?? 'Raíz' }}
          </template>
          <template #active-cell="{ row }">
            <UBadge
              :color="row.original.active ? 'success' : 'neutral'"
              :label="row.original.active ? 'Activa' : 'Inactiva'"
            />
          </template>
          <template #actions-cell="{ row }">
            <CatalogRowActions
              :name="row.original.name"
              :deletable="false"
              @edit="editing = row.original"
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
      title="Nueva categoría"
      description="Puede colgar de otra para formar subcategorías."
    >
      <CategoryForm />
    </UCard>

    <UModal
      v-model:open="editOpen"
      :title="`Editar categoría ${editing?.name ?? ''}`"
      description="Los cambios se reflejan en la tienda y en el selector de artículos."
    >
      <template #body>
        <CategoryForm
          :category="editing"
          @saved="editing = null"
          @cancel="editing = null"
        />
      </template>
    </UModal>
  </div>
</template>
