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

const search = useSearchTerm(() => list.filters.name, (value) => {
  list.filters.name = value
})
const status = useSelectAll(list.filters, 'status')
const statusItems = [
  { label: 'Todos', value: SELECT_ALL },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ label, value })),
]

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
    <UAlert
      v-if="error || list.error"
      color="error"
      icon="ph:warning-circle"
      :title="error ?? list.error ?? undefined"
    />

    <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9.5rem]">
      <UInput
        v-model="search"
        type="search"
        icon="ph:magnifying-glass"
        placeholder="Buscar artículo"
        aria-label="Buscar artículo"
      />
      <USelect
        v-model="status"
        :items="statusItems"
        aria-label="Estado"
      />
    </div>

    <div
      v-if="list.pending && !page"
      class="grid gap-2"
      role="status"
      aria-label="Cargando artículos"
    >
      <USkeleton
        v-for="row in 5"
        :key="row"
        class="h-12"
      />
    </div>

    <p
      v-else-if="page && !page.items.length"
      class="py-4 text-center text-sm text-muted"
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
          class="flex items-center gap-3 rounded-md px-2 py-2 text-sm"
          :class="existing.has(product.id) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-muted'"
        >
          <UCheckbox
            :model-value="existing.has(product.id) || selected.has(product.id)"
            :disabled="existing.has(product.id)"
            :aria-label="`Seleccionar ${product.name}`"
            @update:model-value="toggle(product)"
          />
          <img
            v-if="thumbnail(product)"
            :src="thumbnail(product)!"
            alt=""
            loading="lazy"
            class="aspect-[4/5] w-9 shrink-0 rounded-md border border-default object-cover"
          >
          <span
            v-else
            class="grid aspect-[4/5] w-9 shrink-0 place-items-center rounded-md bg-muted text-muted"
          >
            <UIcon
              name="ph:image"
              class="size-3.5"
              aria-hidden="true"
            />
          </span>
          <span class="grid min-w-0 flex-1">
            <span class="truncate font-medium text-highlighted">{{ product.name }}</span>
            <span class="text-xs text-muted">
              {{ formatMoney(product.basePrice) }}
              <template v-if="product.status !== 'PUBLISHED'"> · {{ STATUS_LABELS[product.status] }} (no se ve en tienda)</template>
            </span>
          </span>
          <span
            v-if="existing.has(product.id)"
            class="shrink-0 text-xs text-muted"
          >Ya está</span>
        </label>
      </li>
    </ul>

    <PagePagination
      v-if="page"
      :page="page"
      :disabled="list.pending"
      @change="list.load"
    />

    <div class="flex flex-wrap items-center justify-end gap-2 border-t border-default pt-4">
      <span
        v-if="selected.size"
        class="mr-auto text-sm text-muted"
      >{{ selected.size }} {{ selected.size === 1 ? 'seleccionado' : 'seleccionados' }}</span>
      <UButton
        color="neutral"
        variant="outline"
        :disabled="pending"
        label="Cancelar"
        @click="emit('cancel')"
      />
      <UButton
        icon="ph:plus"
        :loading="pending"
        :disabled="!selected.size"
        @click="onAdd"
      >
        Agregar{{ selected.size ? ` (${selected.size})` : '' }}
      </UButton>
    </div>
  </div>
</template>
