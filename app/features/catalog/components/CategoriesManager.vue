<script setup lang="ts">
import { useCategoriesStore } from '../stores/categories.store'
import CatalogTableSkeleton from './CatalogTableSkeleton.vue'
import CategoryForm from './CategoryForm.vue'

const store = useCategoriesStore()
const page = computed(() => store.list.data)
const items = computed(() => page.value?.items ?? [])
const filtered = computed(() => Boolean(store.list.filters.name || store.list.filters.active))

onMounted(() => store.list.load())

watch(() => [store.list.filters.name, store.list.filters.active], () => store.list.load(0))
</script>

<template>
  <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
    <UiPanel>
      <div class="grid gap-5">
        <div class="flex flex-col gap-3 sm:flex-row">
          <UiSearch
            id="categories-search"
            v-model="store.list.filters.name"
            label="Buscar categoría"
          />
          <label
            for="categories-active"
            class="sr-only"
          >Estado</label>
          <UiSelect
            id="categories-active"
            v-model="store.list.filters.active"
            class="sm:w-40 [&_select]:h-10 [&_select]:text-sm"
          >
            <option value="">
              Todas
            </option>
            <option value="true">
              Activas
            </option>
            <option value="false">
              Inactivas
            </option>
          </UiSelect>
        </div>

        <UiAlert v-if="store.list.error">
          {{ store.list.error }}
          <button
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
          icon="ph:tree-structure"
          :title="filtered ? 'Sin resultados' : 'Aún no hay categorías'"
          :description="filtered ? 'Prueba con otros filtros.' : 'Todo artículo necesita una categoría. Crea la primera con el formulario.'"
        />

        <div
          v-else-if="items.length"
          class="-mx-5 overflow-x-auto sm:-mx-6"
        >
          <table class="w-full text-left text-sm">
            <thead class="text-ink-muted">
              <tr>
                <th class="px-5 pb-3 font-medium sm:px-6">
                  Categoría
                </th>
                <th class="pb-3 font-medium">
                  Padre
                </th>
                <th class="px-5 pb-3 text-right font-medium sm:px-6">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody
              class="divide-y divide-line border-t border-line transition-opacity"
              :class="store.list.pending && 'opacity-60'"
            >
              <tr
                v-for="category in items"
                :key="category.id"
              >
                <td class="px-5 py-3 sm:px-6">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="category.imageUrl"
                      :src="category.imageUrl"
                      alt=""
                      loading="lazy"
                      class="size-10 shrink-0 rounded-xl border border-line object-cover"
                    >
                    <span
                      v-else
                      class="grid size-10 shrink-0 place-items-center rounded-xl bg-surface text-ink-muted"
                    >
                      <Icon
                        name="ph:image"
                        class="size-4"
                        aria-hidden="true"
                      />
                    </span>
                    <span class="grid min-w-0">
                      <span class="truncate font-medium text-ink">{{ category.name }}</span>
                      <span class="truncate font-mono text-xs text-ink-muted">{{ category.slug }}</span>
                    </span>
                  </div>
                </td>
                <td class="py-3 text-ink-muted">
                  {{ category.parent?.name ?? 'Raíz' }}
                </td>
                <td class="px-5 py-3 text-right sm:px-6">
                  <span :class="category.active ? 'text-ink' : 'text-ink-muted'">
                    {{ category.active ? 'Activa' : 'Inactiva' }}
                  </span>
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
      title="Nueva categoría"
      description="Puede colgar de otra para formar subcategorías."
    >
      <CategoryForm />
    </UiPanel>
  </div>
</template>
