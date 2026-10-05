<script setup lang="ts">
import { STORE_ROUTES } from '~/features/store-catalog'
import { CART_LOW_STOCK_THRESHOLD, MAX_LINE_QUANTITY } from '../constants'
import type { CartLine } from '../types'
import CartQuantity from './CartQuantity.vue'

const props = defineProps<{
  line: CartLine
  pending: boolean
  error: string | null
}>()

const emit = defineEmits<{ quantity: [quantity: number], remove: [], navigate: [] }>()

const to = computed(() => STORE_ROUTES.product(props.line.slug))
const total = computed(() => props.line.unitPrice * props.line.quantity)
const onSale = computed(() => Boolean(props.line.compareAtPrice && props.line.compareAtPrice > props.line.unitPrice))
const max = computed(() => Math.max(1, Math.min(MAX_LINE_QUANTITY, props.line.stock)))

const stockNote = computed(() => {
  const { stock, quantity } = props.line
  if (stock > CART_LOW_STOCK_THRESHOLD) return null
  if (quantity >= stock) return stock === 1 ? 'Es la última pieza en esta talla.' : 'Tienes todas las piezas disponibles.'
  return stock === 1 ? 'Queda 1 pieza en esta talla.' : `Quedan ${stock} piezas en esta talla.`
})
</script>

<template>
  <article
    class="flex gap-4"
    :aria-busy="pending || undefined"
  >
    <NuxtLink
      :to="to"
      class="block w-20 shrink-0 self-start overflow-hidden rounded-lg bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-24"
      tabindex="-1"
      aria-hidden="true"
      @click="emit('navigate')"
    >
      <img
        v-if="line.imageUrl"
        :src="line.imageUrl"
        alt=""
        width="96"
        height="128"
        loading="lazy"
        class="aspect-[3/4] w-full object-cover"
      >
      <span
        v-else
        class="grid aspect-[3/4] place-items-center text-ink-muted"
      >
        <Icon
          name="ph:image"
          class="size-5"
        />
      </span>
    </NuxtLink>

    <div class="flex min-w-0 flex-1 flex-col">
      <div class="flex items-start justify-between gap-3">
        <h3 class="min-w-0 text-[15px] font-medium leading-snug text-ink">
          <NuxtLink
            :to="to"
            class="line-clamp-2 decoration-line underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-accent"
            @click="emit('navigate')"
          >
            {{ line.name }}
          </NuxtLink>
        </h3>
        <p
          class="shrink-0 text-[15px] font-medium tabular-nums"
          :class="onSale ? 'text-accent' : 'text-ink'"
        >
          {{ formatMoney(total) }}
        </p>
      </div>

      <p class="mt-1 flex flex-wrap items-center gap-x-1.5 text-[13px] text-ink-muted">
        <template v-if="line.colorName">
          <span
            v-if="line.colorHex"
            class="size-2.5 shrink-0 rounded-full ring-1 ring-ink/15"
            :style="{ backgroundColor: line.colorHex }"
            aria-hidden="true"
          />
          {{ line.colorName }}
          <span aria-hidden="true">·</span>
        </template>
        Talla {{ line.size }}
      </p>

      <p
        v-if="line.quantity > 1 || onSale"
        class="mt-0.5 flex flex-wrap gap-x-2 text-[13px] tabular-nums text-ink-muted"
      >
        <span>{{ formatMoney(line.unitPrice) }} c/u</span>
        <s v-if="onSale && line.compareAtPrice">{{ formatMoney(line.compareAtPrice) }}</s>
      </p>

      <div class="mt-auto flex items-center justify-between gap-3 pt-3">
        <CartQuantity
          :quantity="line.quantity"
          :max="max"
          :disabled="pending"
          :label="line.name"
          @change="emit('quantity', $event)"
        />
        <button
          type="button"
          class="-mr-2 inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-[13px] text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
          :disabled="pending"
          :aria-label="`Quitar ${line.name} de la bolsa`"
          @click="emit('remove')"
        >
          <Icon
            name="ph:trash-bold"
            class="size-3.5"
            aria-hidden="true"
          />
          Quitar
        </button>
      </div>

      <p
        v-if="error"
        class="mt-2 text-[13px] text-danger"
        role="alert"
      >
        {{ error }}
      </p>
      <p
        v-else-if="stockNote"
        class="mt-2 flex items-center gap-1.5 text-[13px] text-accent"
      >
        <Icon
          name="ph:hourglass-medium-bold"
          class="size-3.5 shrink-0"
          aria-hidden="true"
        />
        {{ stockNote }}
      </p>
    </div>
  </article>
</template>
