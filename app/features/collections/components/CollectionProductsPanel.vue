<script setup lang="ts">
import { useDragReorder } from '../composables/useDragReorder'
import type { CollectionProduct } from '../types'

const props = defineProps<{
  products: CollectionProduct[]
  reorder: (productIds: string[]) => Promise<void>
  remove: (productIds: string[]) => Promise<void>
}>()
const emit = defineEmits<{ add: [] }>()

const selected = ref(new Set<string>())
const removing = ref(false)
const confirming = ref(false)
const error = ref<string | null>(null)

const { items, dragging, saving, onDragStart, onDragOver, onDragEnd, move } = useDragReorder(
  () => props.products,
  p => p.id,
  async (list) => {
    error.value = null
    try {
      await props.reorder(list.map(p => p.id))
    }
    catch (e) {
      error.value = parseApiError(e).message
    }
  },
)

const busy = computed(() => saving.value || removing.value)
const allSelected = computed(() => props.products.length > 0 && selected.value.size === props.products.length)

// Si un producto deja de estar (otra pestana, quitar), sale de la seleccion
watch(() => props.products, (products) => {
  const ids = new Set(products.map(p => p.id))
  selected.value = new Set([...selected.value].filter(id => ids.has(id)))
  if (!selected.value.size) confirming.value = false
})

function toggle(productId: string) {
  const next = new Set(selected.value)
  if (next.has(productId)) next.delete(productId)
  else next.add(productId)
  selected.value = next
}

function toggleAll() {
  selected.value = allSelected.value ? new Set() : new Set(props.products.map(p => p.id))
}

async function onRemove(productIds: string[]) {
  removing.value = true
  error.value = null
  try {
    await props.remove(productIds)
    confirming.value = false
  }
  catch (e) {
    error.value = parseApiError(e).message
  }
  finally {
    removing.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="grid gap-1">
          <h2 class="font-semibold tracking-tight text-highlighted">
            Artículos
          </h2>
          <p class="max-w-[65ch] text-sm leading-relaxed text-muted">
            En el orden en que se ven en la tienda. Los borradores y archivados siguen aquí, pero la tienda no los muestra.
          </p>
        </div>
          <UButton
            size="sm"
            icon="ph:plus"
            :disabled="busy"
            label="Agregar artículos"
            @click="emit('add')"
          />
      </div>
    </template>

    <div class="grid gap-4">
      <UAlert
        v-if="error"
        color="error"
        icon="ph:warning-circle"
        :title="error"
      />

      <UEmpty
        v-if="!products.length"
        icon="ph:coat-hanger"
        title="Colección vacía"
        description="Agrega artículos para que la colección tenga algo que mostrar."
      />

      <template v-else>
        <div class="flex min-h-9 flex-wrap items-center gap-3 text-sm">
          <UCheckbox
            :model-value="allSelected ? true : selected.size ? 'indeterminate' : false"
            :label="selected.size ? `${selected.size} seleccionado(s)` : 'Seleccionar todo'"
            :disabled="busy"
            :ui="{ label: 'font-normal text-muted' }"
            @update:model-value="toggleAll"
          />

          <template v-if="selected.size">
            <template v-if="confirming">
              <span class="text-muted">¿Quitar de la colección? Los artículos no se borran.</span>
              <UButton
                color="error"
                variant="soft"
                size="sm"
                :loading="removing"
                label="Sí, quitar"
                @click="onRemove([...selected])"
              />
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                :disabled="removing"
                label="No"
                @click="confirming = false"
              />
            </template>
            <UButton
              v-else
              color="error"
              variant="soft"
              size="sm"
              icon="ph:minus-circle"
              :disabled="busy"
              label="Quitar seleccionados"
              @click="confirming = true"
            />
          </template>
          <span
            v-else
            class="text-sm text-muted"
          >Arrastra para reordenar.</span>
        </div>

        <ol
          class="-mx-4 divide-y divide-default border-y border-default transition-opacity sm:-mx-6"
          :class="busy && 'opacity-60'"
          :aria-busy="busy || undefined"
          aria-label="Artículos de la colección"
        >
          <li
            v-for="(product, index) in items"
            :key="product.id"
            class="flex items-center gap-3 px-4 py-2.5 transition-colors sm:px-6"
            :class="dragging === product.id ? 'bg-primary/5' : selected.has(product.id) ? 'bg-primary/5' : 'hover:bg-muted'"
            :draggable="!busy"
            @dragstart="onDragStart(product, $event)"
            @dragover.prevent="onDragOver(product)"
            @dragend="onDragEnd"
            @drop.prevent
          >
            <UIcon
              name="ph:dots-six-vertical"
              class="size-5 shrink-0 cursor-grab text-muted active:cursor-grabbing"
              aria-hidden="true"
            />
            <UCheckbox
              :model-value="selected.has(product.id)"
              :disabled="busy"
              :aria-label="`Seleccionar ${product.name}`"
              @update:model-value="toggle(product.id)"
            />
            <span class="w-6 shrink-0 text-right text-xs tabular-nums text-muted">{{ index + 1 }}</span>
            <img
              v-if="product.primaryImageUrl"
              :src="product.primaryImageUrl"
              alt=""
              loading="lazy"
              draggable="false"
              class="aspect-[4/5] w-10 shrink-0 rounded-lg border border-default object-cover"
            >
            <span
              v-else
              class="grid aspect-[4/5] w-10 shrink-0 place-items-center rounded-lg bg-muted text-muted"
            >
              <UIcon
                name="ph:image"
                class="size-4"
                aria-hidden="true"
              />
            </span>
            <span class="grid min-w-0 flex-1">
              <span class="truncate font-medium text-highlighted">{{ product.name }}</span>
              <span class="text-xs tabular-nums text-muted">{{ formatMoney(product.basePrice) }}</span>
            </span>
            <span class="flex shrink-0 gap-0.5">
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                icon="ph:arrow-up"
                :disabled="index === 0 || busy"
                :aria-label="`Subir ${product.name}`"
                @click="move(product, -1)"
              />
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                icon="ph:arrow-down"
                :disabled="index === items.length - 1 || busy"
                :aria-label="`Bajar ${product.name}`"
                @click="move(product, 1)"
              />
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                icon="ph:x"
                :disabled="busy"
                :aria-label="`Quitar ${product.name} de la colección`"
                @click="onRemove([product.id])"
              />
            </span>
          </li>
        </ol>
      </template>
    </div>
  </UCard>
</template>
