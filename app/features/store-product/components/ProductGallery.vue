<script setup lang="ts">
import type { ProductGalleryImage } from '../types'

const props = defineProps<{
  images: ProductGalleryImage[]
  productName: string
}>()

const track = useTemplateRef<HTMLUListElement>('track')
const zoomDialog = useTemplateRef<HTMLDialogElement>('zoomDialog')
const active = ref(0)

const reduceMotion = () => import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Un solo carrusel con scroll-snap: el dedo en movil, miniaturas y flechas en escritorio. */
function goTo(index: number, smooth = true) {
  const el = track.value
  const slide = el?.children[index] as HTMLElement | undefined
  if (!el || !slide) return
  el.scrollTo({ left: slide.offsetLeft, behavior: smooth && !reduceMotion() ? 'smooth' : 'auto' })
}

// La foto visible se detecta con IntersectionObserver, sin escuchar el scroll
let observer: IntersectionObserver | null = null

function observeSlides() {
  observer?.disconnect()
  const el = track.value
  if (!el) return
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) active.value = Number((entry.target as HTMLElement).dataset.index)
    }
  }, { root: el, threshold: 0.6 })
  for (const slide of el.children) observer.observe(slide)
}

// Al cambiar de color cambian las fotos: se vuelve a la primera
watch(() => props.images.map(img => img.id).join(), () => {
  active.value = 0
  nextTick(() => {
    goTo(0, false)
    observeSlides()
  })
})
onMounted(observeSlides)
onBeforeUnmount(() => observer?.disconnect())

const current = computed(() => props.images[active.value] ?? props.images[0])

function openZoom() {
  zoomDialog.value?.showModal()
}

// Cualquier clic fuera de la foto cierra el visor
function onZoomClick(event: MouseEvent) {
  if (!(event.target instanceof HTMLImageElement)) zoomDialog.value?.close()
}

function onZoomKey(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') goTo(Math.min(active.value + 1, props.images.length - 1), false)
  if (event.key === 'ArrowLeft') goTo(Math.max(active.value - 1, 0), false)
}
</script>

<template>
  <div class="grid gap-3 lg:grid-cols-[4.5rem_minmax(0,1fr)] lg:gap-4">
    <!-- Miniaturas: columna en escritorio, ocultas en movil (ahi se usan los puntos) -->
    <ul
      class="no-scrollbar hidden max-h-[min(80dvh,760px)] content-start gap-3 overflow-y-auto lg:grid"
      aria-label="Fotos del producto"
    >
      <li
        v-for="(image, index) in images"
        :key="image.id"
      >
        <button
          type="button"
          class="block aspect-[4/5] w-full overflow-hidden rounded-xl bg-line/40 ring-offset-2 ring-offset-surface transition-[opacity,box-shadow] focus-visible:outline-2 focus-visible:outline-accent"
          :class="index === active ? 'ring-2 ring-ink' : 'opacity-60 hover:opacity-100'"
          :aria-label="`Ver foto ${index + 1} de ${images.length}`"
          :aria-current="index === active || undefined"
          @click="goTo(index)"
        >
          <img
            :src="image.url"
            alt=""
            loading="lazy"
            decoding="async"
            width="160"
            height="200"
            class="size-full object-cover"
          >
        </button>
      </li>
    </ul>

    <div class="group/gallery relative">
      <ul
        ref="track"
        class="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto sm:mx-0 sm:rounded-2xl"
        :aria-label="`Fotos de ${productName}`"
      >
        <li
          v-for="(image, index) in images"
          :key="image.id"
          :data-index="index"
          class="w-full shrink-0 snap-start"
        >
          <button
            type="button"
            class="block aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-line/40 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent lg:max-h-[min(80dvh,760px)]"
            :aria-label="`Ampliar foto ${index + 1}`"
            @click="openZoom"
          >
            <img
              :src="image.url"
              :alt="image.alt"
              :loading="index === 0 ? 'eager' : 'lazy'"
              :fetchpriority="index === 0 ? 'high' : undefined"
              decoding="async"
              width="1200"
              height="1500"
              class="size-full object-cover"
            >
          </button>
        </li>
      </ul>

      <template v-if="images.length > 1">
        <button
          type="button"
          class="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-xl bg-surface-raised/90 text-ink opacity-0 shadow-sm transition-opacity focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-accent disabled:hidden group-hover/gallery:opacity-100 lg:grid"
          :disabled="active === 0"
          aria-label="Foto anterior"
          @click="goTo(active - 1)"
        >
          <Icon
            name="ph:caret-left"
            class="size-4"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          class="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-xl bg-surface-raised/90 text-ink opacity-0 shadow-sm transition-opacity focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-accent disabled:hidden group-hover/gallery:opacity-100 lg:grid"
          :disabled="active === images.length - 1"
          aria-label="Foto siguiente"
          @click="goTo(active + 1)"
        >
          <Icon
            name="ph:caret-right"
            class="size-4"
            aria-hidden="true"
          />
        </button>

        <!-- Puntos en movil: indican la posicion y llevan a cada foto -->
        <div class="mt-3 flex justify-center gap-1.5 lg:hidden">
          <button
            v-for="(image, index) in images"
            :key="image.id"
            type="button"
            class="h-1.5 rounded-full transition-[width,background-color] duration-300"
            :class="index === active ? 'w-5 bg-ink' : 'w-1.5 bg-line'"
            :aria-label="`Ver foto ${index + 1} de ${images.length}`"
            :aria-current="index === active || undefined"
            @click="goTo(index)"
          />
        </div>
      </template>
    </div>

    <dialog
      ref="zoomDialog"
      :aria-label="`Foto ampliada de ${productName}`"
      class="m-auto h-[100dvh] max-h-none w-full max-w-none bg-surface p-0 text-ink backdrop:bg-ink/60"
      @keydown="onZoomKey"
      @click="onZoomClick"
    >
      <div class="relative grid h-full place-items-center p-4 sm:p-10">
        <img
          v-if="current"
          :src="current.url.replace(/w=\d+/, 'w=2000')"
          :alt="current.alt"
          decoding="async"
          class="max-h-full max-w-full rounded-2xl object-contain"
        >
        <button
          type="button"
          class="absolute right-4 top-4 grid size-11 place-items-center rounded-xl bg-surface-raised text-ink shadow-sm focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Cerrar foto"
          @click="zoomDialog?.close()"
        >
          <Icon
            name="ph:x"
            class="size-5"
            aria-hidden="true"
          />
        </button>
      </div>
    </dialog>
  </div>
</template>
