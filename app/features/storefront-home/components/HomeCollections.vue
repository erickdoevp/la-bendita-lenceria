<script setup lang="ts">
import { STORE_ROUTES } from '~/features/store-catalog'
import { useHomeCollections } from '../composables/useHomeSection'
import HomeSectionError from './HomeSectionError.vue'

const { data: collections, loading, errorMessage, refresh } = useHomeCollections()

// En escritorio, la coleccion activa (hover o foco) decide la foto grande
const activeIndex = ref(0)
const items = computed(() => collections.value ?? [])

const productLabel = (count: number) => `${count} ${count === 1 ? 'pieza' : 'piezas'}`
</script>

<template>
  <section
    v-if="loading || errorMessage || items.length"
    aria-labelledby="home-collections-title"
    class="border-y border-line bg-surface-raised"
  >
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <h2
        id="home-collections-title"
        class="reveal text-3xl font-semibold tracking-tight text-ink md:text-4xl"
      >
        Colecciones
      </h2>

      <HomeSectionError
        v-if="errorMessage"
        class="mt-8"
        :message="errorMessage"
        @retry="refresh()"
      />

      <div
        v-else-if="loading"
        class="mt-8 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
        aria-hidden="true"
      >
        <div class="grid content-start gap-6">
          <UiSkeleton
            v-for="n in 4"
            :key="n"
            class="h-14"
          />
        </div>
        <UiSkeleton class="hidden aspect-[6/5] rounded-2xl lg:block" />
      </div>

      <div
        v-else
        class="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
      >
        <!-- Lista: en movil cada fila lleva su propia foto -->
        <ol class="grid content-start gap-4 lg:gap-0">
          <li
            v-for="(collection, index) in items"
            :key="collection.id"
            class="group relative grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-4 lg:block lg:border-b lg:border-line lg:py-6 lg:first:pt-0"
            @mouseenter="activeIndex = index"
            @focusin="activeIndex = index"
          >
            <img
              :src="collection.imageUrl"
              alt=""
              loading="lazy"
              decoding="async"
              width="400"
              height="500"
              class="aspect-[4/5] w-full rounded-xl object-cover lg:hidden"
            >
            <div class="grid gap-1.5">
              <div class="flex items-baseline justify-between gap-4">
                <h3
                  class="text-2xl font-semibold tracking-tight transition-colors duration-300 md:text-3xl"
                  :class="activeIndex === index ? 'lg:text-ink' : 'lg:text-ink-muted'"
                >
                  <NuxtLink
                    :to="STORE_ROUTES.collection(collection.slug)"
                    class="text-ink after:absolute after:inset-0 group-hover:text-accent focus-visible:outline-none focus-visible:after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-accent lg:text-inherit"
                  >
                    {{ collection.name }}
                  </NuxtLink>
                </h3>
                <span class="shrink-0 text-sm tabular-nums text-ink-muted">
                  {{ productLabel(collection.productCount) }}
                </span>
              </div>
              <p
                class="max-w-[48ch] text-sm leading-relaxed text-ink-muted transition-[opacity] duration-300 md:text-[15px]"
                :class="activeIndex === index ? 'lg:opacity-100' : 'lg:opacity-60'"
              >
                {{ collection.summary }}
              </p>
            </div>
          </li>
        </ol>

        <!-- Foto grande en escritorio: se apilan y cambia la opacidad -->
        <div class="relative hidden aspect-[6/5] overflow-hidden rounded-2xl bg-line/40 lg:sticky lg:top-24 lg:block lg:self-start">
          <img
            v-for="(collection, index) in items"
            :key="collection.id"
            :src="collection.imageUrl"
            :alt="activeIndex === index ? `Colección ${collection.name}` : ''"
            :aria-hidden="activeIndex !== index || undefined"
            loading="lazy"
            decoding="async"
            width="1200"
            height="1000"
            class="absolute inset-0 size-full object-cover transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            :class="activeIndex === index ? 'scale-100 opacity-100' : 'opacity-0 motion-safe:scale-[1.03]'"
          >
        </div>
      </div>
    </div>
  </section>
</template>
