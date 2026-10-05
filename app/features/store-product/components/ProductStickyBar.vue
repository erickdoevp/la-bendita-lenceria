<script setup lang="ts">
import type { AddToBagState } from '../composables/useAddToBag'

defineProps<{
  visible: boolean
  name: string
  price: number
  imageUrl: string | null
  size: string | null
  soldOut: boolean
  bagState: AddToBagState
}>()

const emit = defineEmits<{ submit: [] }>()
</script>

<template>
  <!-- Solo en movil: el boton principal queda lejos al bajar a descripcion y resenas -->
  <div
    class="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface-raised/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden"
    :class="visible ? 'translate-y-0' : 'translate-y-full'"
    :aria-hidden="!visible || undefined"
    :inert="!visible || undefined"
  >
    <div class="flex items-center gap-3">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        alt=""
        width="80"
        height="100"
        class="aspect-[4/5] w-10 shrink-0 rounded-lg object-cover"
      >
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-ink">
          {{ name }}
        </p>
        <p class="text-sm tabular-nums text-ink-muted">
          {{ formatMoney(price) }}<template v-if="size">
            · Talla {{ size }}
          </template>
        </p>
      </div>
      <UiButton
        :loading="bagState === 'adding'"
        :disabled="soldOut"
        :icon="bagState === 'added' ? 'ph:check' : undefined"
        @click="emit('submit')"
      >
        {{ soldOut ? 'Agotado' : bagState === 'added' ? 'Agregado' : size ? 'Agregar' : 'Elegir talla' }}
      </UiButton>
    </div>
  </div>
</template>
