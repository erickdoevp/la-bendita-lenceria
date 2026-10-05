<script setup lang="ts">
import type { StoreProduct } from '../types'
import ProductCard from './ProductCard.vue'
import ProductCardSkeleton from './ProductCardSkeleton.vue'

const props = defineProps<{
  title: string
  /** id del h2, para el aria-labelledby de la seccion. */
  titleId: string
  products: StoreProduct[] | null
  loading?: boolean
  /** Las primeras tarjetas cargan su foto sin lazy. */
  eagerCount?: number
}>()

defineSlots<{
  /** Enlaces junto al titulo, p. ej. "Ver novedades". */
  actions?: () => unknown
  /** Error o vacio: se pinta cuando no hay productos y no esta cargando. */
  fallback?: () => unknown
}>()

const track = useTemplateRef<HTMLUListElement>('track')
const atStart = ref(true)
const atEnd = ref(false)
const hasProducts = computed(() => Boolean(props.products?.length))

// Observa la primera y la ultima tarjeta para habilitar las flechas sin escuchar el scroll
let observer: IntersectionObserver | null = null

function observeEdges() {
  observer?.disconnect()
  const el = track.value
  if (!el || !el.children.length) return
  const first = el.firstElementChild!
  const last = el.lastElementChild!
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === first) atStart.value = entry.intersectionRatio > 0.95
      if (entry.target === last) atEnd.value = entry.intersectionRatio > 0.95
    }
  }, { root: el, threshold: [0, 0.95, 1] })
  observer.observe(first)
  observer.observe(last)
}

watch(() => props.products?.length, () => nextTick(observeEdges))
onMounted(observeEdges)
onBeforeUnmount(() => observer?.disconnect())

function scrollByPage(direction: 1 | -1) {
  const el = track.value
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: reduce ? 'auto' : 'smooth' })
}

const arrowClass = 'hidden size-10 place-items-center rounded-xl border border-line text-ink transition-[background-color,opacity,transform] hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40 md:grid'
</script>

<template>
  <section :aria-labelledby="titleId">
    <div class="mx-auto flex max-w-7xl items-end justify-between gap-6 px-4 sm:px-6 lg:px-10">
      <h2
        :id="titleId"
        class="reveal text-3xl font-semibold tracking-tight text-ink md:text-4xl"
      >
        {{ title }}
      </h2>
      <div class="flex items-center gap-2">
        <slot name="actions" />
        <template v-if="hasProducts">
          <button
            type="button"
            :class="arrowClass"
            :disabled="atStart"
            aria-label="Ver anteriores"
            @click="scrollByPage(-1)"
          >
            <Icon
              name="ph:caret-left"
              class="size-4"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            :class="arrowClass"
            :disabled="atEnd"
            aria-label="Ver siguientes"
            @click="scrollByPage(1)"
          >
            <Icon
              name="ph:caret-right"
              class="size-4"
              aria-hidden="true"
            />
          </button>
        </template>
      </div>
    </div>

    <div class="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-10">
      <div
        v-if="loading && !hasProducts"
        class="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
      >
        <ProductCardSkeleton
          v-for="n in 4"
          :key="n"
          :class="{ 'hidden md:grid': n > 2 }"
        />
      </div>

      <slot
        v-else-if="!hasProducts"
        name="fallback"
      />

      <!-- Carrusel con scroll-snap: en movil se desliza con el dedo, en escritorio tambien con las flechas -->
      <ul
        v-else
        ref="track"
        class="no-scrollbar -mx-4 grid snap-x snap-mandatory auto-cols-[72%] grid-flow-col gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:auto-cols-[42%] sm:scroll-px-6 sm:px-6 md:gap-6 lg:mx-0 lg:auto-cols-[calc((100%_-_4.5rem)/4)] lg:scroll-px-0 lg:px-0"
        :aria-label="title"
      >
        <li
          v-for="(product, index) in products"
          :key="product.id"
          class="snap-start"
        >
          <ProductCard
            :product="product"
            :eager="index < (eagerCount ?? 0)"
          />
        </li>
      </ul>
    </div>
  </section>
</template>
