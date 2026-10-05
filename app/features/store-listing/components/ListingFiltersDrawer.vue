<script setup lang="ts">
import { useListingQuery } from '../composables/useListingQuery'
import type { ListingFacets } from '../types'
import ListingFilters from './ListingFilters.vue'

defineProps<{
  facets: ListingFacets
  totalItems: number
  /** Hay una consulta en curso: el total aun no corresponde a los filtros. */
  pending: boolean
}>()

const open = defineModel<boolean>('open', { required: true })
const dialog = ref<HTMLDialogElement | null>(null)
const { activeCount, clearFilters } = useListingQuery()

// <dialog> modal: atrapa el foco y cierra con Escape sin codigo extra
watch(open, (value) => {
  if (value && !dialog.value?.open) dialog.value?.showModal()
  if (!value && dialog.value?.open) dialog.value.close()
}, { flush: 'post' })

function onClick(event: MouseEvent) {
  if (event.target === dialog.value) open.value = false
}
</script>

<template>
  <dialog
    ref="dialog"
    aria-label="Filtros"
    class="m-0 ml-auto h-[100dvh] max-h-none w-full max-w-sm bg-surface p-0 text-ink backdrop:bg-ink/40 open:motion-safe:animate-[drawer-right-in_220ms_ease-out]"
    @close="open = false"
    @click="onClick"
  >
    <div class="flex h-full flex-col">
      <div class="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
        <h2 class="text-lg font-semibold tracking-tight">
          Filtros
        </h2>
        <button
          type="button"
          class="grid size-10 place-items-center rounded-xl transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Cerrar filtros"
          @click="open = false"
        >
          <Icon
            name="ph:x"
            class="size-5"
            aria-hidden="true"
          />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-4">
        <ListingFilters
          :facets="facets"
          id-prefix="drawer"
        />
      </div>

      <!-- Los filtros se aplican al instante; el boton solo cierra y confirma el total -->
      <div class="grid shrink-0 grid-cols-[auto_1fr] gap-3 border-t border-line bg-surface-raised p-4">
        <UiButton
          variant="secondary"
          :disabled="!activeCount"
          @click="clearFilters()"
        >
          Limpiar filtros
        </UiButton>
        <UiButton
          :loading="pending"
          @click="open = false"
        >
          Ver {{ totalItems }} {{ totalItems === 1 ? 'producto' : 'productos' }}
        </UiButton>
      </div>
    </div>
  </dialog>
</template>
