<script setup lang="ts">
import { RatingStars } from '~/features/reviews'
import { useCartStore } from '~/features/store-cart'
import { LOW_STOCK_THRESHOLD, MAX_QUANTITY, PRODUCT_SERVICE_NOTES } from '../constants'
import type { AddToBagState } from '../composables/useAddToBag'
import type { VariantSelection } from '../composables/useVariantSelection'
import type { StoreProductDetail } from '../types'
import ProductColorSelector from './ProductColorSelector.vue'
import ProductSizeSelector from './ProductSizeSelector.vue'
import QuantityStepper from './QuantityStepper.vue'

const props = defineProps<{
  product: StoreProductDetail
  selection: VariantSelection
  categoryLabel: string | null
  bagState: AddToBagState
  bagError: string | null
  sizeError: string | null
}>()

const emit = defineEmits<{ submit: [], openGuide: [] }>()
const quantity = defineModel<number>('quantity', { required: true })
const cart = useCartStore()

const { color, colorKey, size, variant, price, availability, colorSoldOut, setColor, setSize } = props.selection

const discount = computed(() => {
  const compare = props.product.compareAtPrice
  return compare && compare > price.value ? Math.round((1 - price.value / compare) * 100) : null
})

const maxQuantity = computed(() => Math.max(1, Math.min(MAX_QUANTITY, variant.value?.stock ?? MAX_QUANTITY)))

/** Mensaje bajo los selectores segun la variante elegida. */
const stockNote = computed(() => {
  if (!size.value || !variant.value) return null
  if (variant.value.stock <= 0) return { tone: 'muted', text: `La talla ${size.value} en ${color.value?.name.toLowerCase()} está agotada. Prueba otro color.` }
  if (variant.value.stock <= LOW_STOCK_THRESHOLD) {
    const stock = variant.value.stock
    return { tone: 'accent', text: stock === 1 ? 'Queda 1 pieza en esta talla.' : `Quedan ${stock} piezas en esta talla.` }
  }
  return null
})

const soldOut = computed(() => Boolean(variant.value && variant.value.stock <= 0))
// Etiqueta corta en pantallas chicas para que contador, boton y favoritos quepan en una fila
const buttonLabel = computed(() => {
  if (props.bagState === 'added') return { short: 'Agregado', long: 'Agregado a tu bolsa' }
  if (soldOut.value) return { short: 'Agotado', long: 'Agotado' }
  return { short: 'Agregar', long: 'Agregar a la bolsa' }
})

const ratingLabel = computed(() => {
  const count = props.product.rating?.count ?? 0
  return `${count} ${count === 1 ? 'reseña' : 'reseñas'}`
})
</script>

<template>
  <div class="grid gap-7">
    <div class="grid gap-3">
      <p
        v-if="categoryLabel"
        class="text-[13px] text-ink-muted"
      >
        {{ categoryLabel }}<template v-if="product.isNew">
          <span class="text-accent"> · Nuevo</span>
        </template>
      </p>
      <h1 class="text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
        {{ product.name }}
      </h1>
      <a
        v-if="product.rating"
        href="#resenas"
        class="inline-flex items-center gap-2 justify-self-start text-sm text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
      >
        <RatingStars :rating="product.rating.average" />
        <span class="tabular-nums">{{ product.rating.average.toFixed(1) }}</span>
        <span class="underline underline-offset-4">{{ ratingLabel }}</span>
      </a>
      <p class="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-1 tabular-nums">
        <span
          class="text-2xl font-semibold"
          :class="discount ? 'text-accent' : 'text-ink'"
        >{{ formatMoney(price) }}</span>
        <template v-if="discount && product.compareAtPrice">
          <s class="text-ink-muted">{{ formatMoney(product.compareAtPrice) }}</s>
          <span class="text-sm font-medium text-accent">{{ discount }} % de descuento</span>
        </template>
      </p>
      <p class="text-[13px] text-ink-muted">
        Precio con IVA incluido.
      </p>
    </div>

    <ProductColorSelector
      v-if="product.colors.length"
      :colors="product.colors"
      :selected="colorKey"
      :is-sold-out="colorSoldOut"
      @select="setColor"
    />

    <div class="grid gap-3">
      <ProductSizeSelector
        :sizes="product.sizes"
        :selected="size"
        :availability="availability"
        :error="sizeError"
        @select="setSize"
        @open-guide="emit('openGuide')"
      />
      <p
        v-if="stockNote"
        class="flex items-center gap-2 text-sm"
        :class="stockNote.tone === 'accent' ? 'font-medium text-accent' : 'text-ink-muted'"
        aria-live="polite"
      >
        <Icon
          :name="stockNote.tone === 'accent' ? 'ph:hourglass-medium' : 'ph:info'"
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        {{ stockNote.text }}
      </p>
    </div>

    <div class="grid gap-3">
      <div class="flex min-w-0 gap-3">
        <QuantityStepper
          v-model="quantity"
          :max="maxQuantity"
          :disabled="soldOut"
        />
        <UiButton
          class="flex-1"
          :icon="bagState === 'added' ? 'ph:check' : 'ph:handbag'"
          :loading="bagState === 'adding'"
          :disabled="soldOut"
          @click="emit('submit')"
        >
          <span class="sm:hidden">{{ buttonLabel.short }}</span>
          <span class="max-sm:hidden">{{ buttonLabel.long }}</span>
        </UiButton>
        <!-- TODO: conectar con favoritos cuando exista el endpoint -->
        <button
          type="button"
          class="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-surface-raised text-ink transition-[color,transform] hover:text-accent focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.96]"
          :aria-label="`Guardar ${product.name} en favoritos`"
        >
          <Icon
            name="ph:heart"
            class="size-5"
            aria-hidden="true"
          />
        </button>
      </div>

      <p
        v-if="bagState === 'error' && bagError"
        class="text-[13px] text-danger"
        role="alert"
      >
        {{ bagError }}
      </p>
      <p
        v-else-if="bagState === 'added'"
        class="flex flex-wrap items-center gap-x-2 text-sm text-ink"
        role="status"
      >
        <Icon
          name="ph:check-circle"
          class="size-4 text-success"
          aria-hidden="true"
        />
        Listo, tu talla {{ size }} ya está en la bolsa.
        <button
          type="button"
          class="font-medium text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
          @click="cart.open()"
        >
          Ver bolsa
        </button>
      </p>
    </div>

    <ul class="grid gap-3 border-t border-line pt-6">
      <li
        v-for="note in PRODUCT_SERVICE_NOTES"
        :key="note.text"
        class="flex items-center gap-3 text-sm text-ink"
      >
        <Icon
          :name="note.icon"
          class="size-5 shrink-0 text-accent"
          aria-hidden="true"
        />
        {{ note.text }}
      </li>
    </ul>
  </div>
</template>
