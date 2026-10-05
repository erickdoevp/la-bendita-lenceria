<script setup lang="ts">
import { STORE_ROUTES } from '../constants'
import type { StoreProduct } from '../types'

const props = defineProps<{
  product: StoreProduct
  /** La primera fila visible carga la imagen sin lazy para no retrasar el LCP. */
  eager?: boolean
}>()

const onSale = computed(() =>
  props.product.compareAtPrice !== null && props.product.compareAtPrice > props.product.price,
)
const MAX_SWATCHES = 4
const extraColors = computed(() => Math.max(0, props.product.colors.length - MAX_SWATCHES))
</script>

<template>
  <article class="group relative grid gap-3">
    <div class="relative aspect-[4/5] overflow-hidden rounded-2xl bg-line/40">
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.name"
        :loading="eager ? 'eager' : 'lazy'"
        decoding="async"
        width="600"
        height="750"
        class="size-full object-cover transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.03]"
        :class="{ 'group-hover:opacity-0': product.hoverImageUrl }"
      >
      <img
        v-if="product.hoverImageUrl"
        :src="product.hoverImageUrl"
        alt=""
        loading="lazy"
        decoding="async"
        width="600"
        height="750"
        class="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      >
      <div
        v-if="!product.imageUrl"
        class="grid size-full place-items-center text-ink-muted"
      >
        <Icon
          name="ph:image"
          class="size-8"
          aria-hidden="true"
        />
      </div>

      <!-- TODO: conectar con wishlist cuando exista el endpoint -->
      <button
        type="button"
        class="absolute right-3 top-3 grid size-9 place-items-center rounded-xl bg-surface-raised/90 text-ink opacity-100 transition-[opacity,transform] duration-200 hover:text-accent focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.96] md:opacity-0 md:group-hover:opacity-100"
        :aria-label="`Guardar ${product.name} en favoritos`"
      >
        <Icon
          name="ph:heart"
          class="size-[18px]"
          aria-hidden="true"
        />
      </button>
    </div>

    <div class="grid gap-1.5">
      <p class="text-[13px] text-ink-muted">
        {{ product.categoryName }}<template v-if="product.isNew">
          <span class="text-accent"> · Nuevo</span>
        </template>
      </p>
      <h3 class="text-[15px] font-medium leading-snug text-ink">
        <!-- El enlace cubre toda la tarjeta; el boton de favoritos queda encima -->
        <NuxtLink
          :to="STORE_ROUTES.product(product.slug)"
          class="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-accent"
        >
          {{ product.name }}
        </NuxtLink>
      </h3>
      <div class="flex items-center justify-between gap-3">
        <p class="flex items-baseline gap-2 text-[15px] tabular-nums">
          <span :class="onSale ? 'font-semibold text-accent' : 'text-ink'">{{ formatMoney(product.price) }}</span>
          <s
            v-if="onSale && product.compareAtPrice"
            class="text-[13px] text-ink-muted"
          >{{ formatMoney(product.compareAtPrice) }}</s>
        </p>
        <ul
          v-if="product.colors.length"
          class="flex items-center gap-1"
          :aria-label="`${product.colors.length} colores`"
        >
          <li
            v-for="color in product.colors.slice(0, MAX_SWATCHES)"
            :key="color.hex"
            class="size-3.5 rounded-full ring-1 ring-ink/15"
            :style="{ backgroundColor: color.hex }"
            :title="color.name"
          />
          <li
            v-if="extraColors"
            class="text-xs text-ink-muted"
          >
            +{{ extraColors }}
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>
