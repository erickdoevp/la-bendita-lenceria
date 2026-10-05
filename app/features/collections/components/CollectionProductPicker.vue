<script setup lang="ts">
import { STATUS_LABELS, useProductsApi } from '~/features/products'
import type { ProductListItem, ProductStatus } from '~/features/products'

const props = defineProps<{
  /** Productos que ya estan en la coleccion. */
  existingIds: string[]
  add: (productIds: string[]) => Promise<void>
}>()
const emit = defineEmits<{ done: [count: number], cancel: [] }>()

const productsApi = useProductsApi()
const list = reactive(createPagedList(
  query => productsApi.list(query),
  { name: '', status: '' as ProductStatus | '' },
  10,
))
// La seleccion se conserva al buscar y cambiar de pagina, en orden de eleccion
const selected = ref(new Map<string, ProductListItem>())
const pending = ref(false)
const error = ref<string | null>(null)

const existing = computed(() => new Set(props.existingIds))
const page = computed(() => list.data)

onMounted(() => list.load(0))
watch(() => [list.filters.name, list.filters.status], () => list.load(0))

function toggle(product: ProductListItem) {
  const next = new Map(selected.value)
  if (next.has(product.id)) next.delete(product.id)
  else next.set(product.id, product)
  selected.value = next
}

function thumbnail(product: ProductListItem) {
  const images = product.images ?? []
  return images.find(i => i.isPrimary)?.url ?? images[0]?.url ?? null
}

async function onAdd() {
  if (!selected.value.size) return
  pending.value = true
  error.value = null
  try {
    // Se agregan al final, en el orden en que se eligieron
    await props.add([...selected.value.keys()])
    emit('done', selected.value.size)
  }
  catch (e) {
    error.value = parseApiError(e).message
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="grid gap-4">
    <UiAlert v-if="error || list.error">
      {{ error ?? list.error }}
    </UiAlert>

    <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9.5rem]">
      <UiSearch
        id="collection-picker-search"
        v-model="list.filters.name"
        label="Buscar artículo"
      />
      <div>
        <label
          for="collection-picker-status"
          class="sr-only"
        >Estado</label>
        <UiSelect
          id="collection-picker-status"
          v-model="list.filters.status"
          class="[&_select]:h-10 [&_select]:text-sm"
        >
          <option value="">
            Todos
          </option>
          <option
            v-for="(label, value) in STATUS_LABELS"
            :key="value"
            :value="value"
          >
            {{ label }}
          </option>
        </UiSelect>
      </div>
    </div>

    <div
      v-if="list.pending && !page"
      class="grid gap-2"
      role="status"
      aria-label="Cargando artículos"
    >
      <UiSkeleton
        v-for="row in 5"
        :key="row"
        class="h-12"
      />
    </div>

    <p
      v-else-if="page && !page.items.length"
      class="py-4 text-center text-sm text-ink-muted"
    >
      Ningún artículo coincide.
    </p>

    <ul
      v-else-if="page"
      class="grid max-h-[22rem] gap-1 overflow-y-auto transition-opacity"
      :class="list.pending && 'opacity-60'"
    >
      <li
        v-for="product in page.items"
        :key="product.id"
      >
        <label
          class="flex items-center gap-3 rounded-xl px-2 py-2 text-sm"
          :class="existing.has(product.id) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-surface'"
        >
          <input
            type="checkbox"
            class="size-4 shrink-0 accent-[var(--accent)]"
            :checked="existing.has(product.id) || selected.has(product.id)"
            :disabled="existing.has(product.id)"
            @change="toggle(product)"
          >
          <img
            v-if="thumbnail(product)"
            :src="thumbnail(product)!"
            alt=""
            loading="lazy"
            class="aspect-[4/5] w-9 shrink-0 rounded-md border border-line object-cover"
          >
          <span
            v-else
            class="grid aspect-[4/5] w-9 shrink-0 place-items-center rounded-md bg-surface text-ink-muted"
          >
            <Icon
              name="ph:image"
              class="size-3.5"
              aria-hidden="true"
            />
          </span>
          <span class="grid min-w-0 flex-1">
            <span class="truncate font-medium text-ink">{{ product.name }}</span>
            <span class="text-xs text-ink-muted">
              {{ formatMoney(product.basePrice) }}
              <template v-if="product.status !== 'PUBLISHED'"> · {{ STATUS_LABELS[product.status] }} (no se ve en tienda)</template>
            </span>
          </span>
          <span
            v-if="existing.has(product.id)"
            class="shrink-0 text-xs text-ink-muted"
          >Ya está</span>
        </label>
      </li>
    </ul>

    <UiPagination
      v-if="page"
      :page="page.page"
      :total-pages="page.totalPages"
      :total-elements="page.totalElements"
      :disabled="list.pending"
      @change="list.load"
    />

    <div class="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
      <span
        v-if="selected.size"
        class="mr-auto text-sm text-ink-muted"
      >{{ selected.size }} {{ selected.size === 1 ? 'seleccionado' : 'seleccionados' }}</span>
      <UiButton
        variant="secondary"
        :disabled="pending"
        @click="emit('cancel')"
      >
        Cancelar
      </UiButton>
      <UiButton
        icon="ph:plus"
        :loading="pending"
        :disabled="!selected.size"
        @click="onAdd"
      >
        Agregar{{ selected.size ? ` (${selected.size})` : '' }}
      </UiButton>
    </div>
  </div>
</template>
