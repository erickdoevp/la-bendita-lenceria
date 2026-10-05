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
  <UiPanel
    title="Artículos"
    description="En el orden en que se ven en la tienda. Los borradores y archivados siguen aquí, pero la tienda no los muestra."
  >
    <template #actions>
      <UiButton
        size="sm"
        icon="ph:plus"
        :disabled="busy"
        @click="emit('add')"
      >
        Agregar artículos
      </UiButton>
    </template>

    <div class="grid gap-4">
      <UiAlert v-if="error">
        {{ error }}
      </UiAlert>

      <UiEmptyState
        v-if="!products.length"
        icon="ph:coat-hanger"
        title="Colección vacía"
        description="Agrega artículos para que la colección tenga algo que mostrar."
      />

      <template v-else>
        <div class="flex min-h-9 flex-wrap items-center gap-3 text-sm">
          <label class="inline-flex cursor-pointer items-center gap-2 text-ink-muted">
            <input
              type="checkbox"
              class="size-4 accent-[var(--accent)]"
              :checked="allSelected"
              :indeterminate="selected.size > 0 && !allSelected"
              :disabled="busy"
              @change="toggleAll"
            >
            {{ selected.size ? `${selected.size} seleccionado(s)` : 'Seleccionar todo' }}
          </label>

          <template v-if="selected.size">
            <template v-if="confirming">
              <span class="text-ink-muted">¿Quitar de la colección? Los artículos no se borran.</span>
              <UiButton
                variant="danger"
                size="sm"
                :loading="removing"
                @click="onRemove([...selected])"
              >
                Sí, quitar
              </UiButton>
              <UiButton
                variant="ghost"
                size="sm"
                :disabled="removing"
                @click="confirming = false"
              >
                No
              </UiButton>
            </template>
            <UiButton
              v-else
              variant="danger"
              size="sm"
              icon="ph:minus-circle"
              :disabled="busy"
              @click="confirming = true"
            >
              Quitar seleccionados
            </UiButton>
          </template>
          <span
            v-else
            class="text-[13px] text-ink-muted"
          >Arrastra para reordenar.</span>
        </div>

        <ol
          class="-mx-5 divide-y divide-line border-y border-line transition-opacity sm:-mx-6"
          :class="busy && 'opacity-60'"
          :aria-busy="busy || undefined"
          aria-label="Artículos de la colección"
        >
          <li
            v-for="(product, index) in items"
            :key="product.id"
            class="flex items-center gap-3 px-5 py-2.5 transition-colors sm:px-6"
            :class="dragging === product.id ? 'bg-accent/5' : selected.has(product.id) ? 'bg-accent/5' : 'hover:bg-surface'"
            :draggable="!busy"
            @dragstart="onDragStart(product, $event)"
            @dragover.prevent="onDragOver(product)"
            @dragend="onDragEnd"
            @drop.prevent
          >
            <Icon
              name="ph:dots-six-vertical"
              class="size-5 shrink-0 cursor-grab text-ink-muted active:cursor-grabbing"
              aria-hidden="true"
            />
            <input
              type="checkbox"
              class="size-4 shrink-0 accent-[var(--accent)]"
              :checked="selected.has(product.id)"
              :disabled="busy"
              :aria-label="`Seleccionar ${product.name}`"
              @change="toggle(product.id)"
            >
            <span class="w-6 shrink-0 text-right text-xs tabular-nums text-ink-muted">{{ index + 1 }}</span>
            <img
              v-if="product.primaryImageUrl"
              :src="product.primaryImageUrl"
              alt=""
              loading="lazy"
              draggable="false"
              class="aspect-[4/5] w-10 shrink-0 rounded-lg border border-line object-cover"
            >
            <span
              v-else
              class="grid aspect-[4/5] w-10 shrink-0 place-items-center rounded-lg bg-surface text-ink-muted"
            >
              <Icon
                name="ph:image"
                class="size-4"
                aria-hidden="true"
              />
            </span>
            <span class="grid min-w-0 flex-1">
              <span class="truncate font-medium text-ink">{{ product.name }}</span>
              <span class="text-xs tabular-nums text-ink-muted">{{ formatMoney(product.basePrice) }}</span>
            </span>
            <span class="flex shrink-0 gap-0.5">
              <UiButton
                variant="ghost"
                size="sm"
                icon="ph:arrow-up"
                :disabled="index === 0 || busy"
                :aria-label="`Subir ${product.name}`"
                @click="move(product, -1)"
              />
              <UiButton
                variant="ghost"
                size="sm"
                icon="ph:arrow-down"
                :disabled="index === items.length - 1 || busy"
                :aria-label="`Bajar ${product.name}`"
                @click="move(product, 1)"
              />
              <UiButton
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
  </UiPanel>
</template>
