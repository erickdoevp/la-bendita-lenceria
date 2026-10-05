<script setup lang="ts">
import { STORE_ROUTES } from '~/features/store-catalog'
import { useFeaturedCategories } from '../composables/useHomeSection'
import HomeSectionError from './HomeSectionError.vue'

const { data: categories, loading, errorMessage, refresh } = useFeaturedCategories()

// La primera ocupa el bloque grande; el resto llena la cuadricula de 2 x 2
const MAX_CATEGORIES = 5
const visible = computed(() => (categories.value ?? []).slice(0, MAX_CATEGORIES))

const cellClass = (index: number) =>
  index === 0
    ? 'col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto'
    : 'aspect-[4/5] md:aspect-[5/4]'
</script>

<template>
  <section
    v-if="loading || errorMessage || visible.length"
    aria-labelledby="home-categories-title"
    class="mx-auto max-w-7xl px-4 pb-4 pt-16 sm:px-6 lg:px-10 lg:pt-24"
  >
    <h2
      id="home-categories-title"
      class="reveal text-3xl font-semibold tracking-tight text-ink md:text-4xl"
    >
      Compra por categoría
    </h2>

    <HomeSectionError
      v-if="errorMessage"
      class="mt-8"
      :message="errorMessage"
      @retry="refresh()"
    />

    <div
      v-else-if="loading"
      class="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
      aria-hidden="true"
    >
      <UiSkeleton
        v-for="n in MAX_CATEGORIES"
        :key="n"
        class="rounded-2xl"
        :class="cellClass(n - 1)"
      />
    </div>

    <ul
      v-else
      class="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
    >
      <li
        v-for="(category, index) in visible"
        :key="category.id"
        class="reveal group relative overflow-hidden rounded-2xl bg-line/40"
        :class="cellClass(index)"
      >
        <img
          :src="category.imageUrl"
          :alt="category.name"
          loading="lazy"
          decoding="async"
          width="900"
          height="1100"
          class="absolute inset-0 size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.04]"
        >
        <!-- Degradado para que el texto blanco sea legible sobre cualquier foto -->
        <div
          class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-zinc-950/75 via-zinc-950/25 to-transparent"
          aria-hidden="true"
        />
        <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5">
          <div class="grid gap-0.5">
            <h3
              class="font-semibold tracking-tight text-zinc-50"
              :class="index === 0 ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'"
            >
              <NuxtLink
                :to="STORE_ROUTES.category(category.slug)"
                class="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:-outline-offset-4 focus-visible:after:outline-zinc-50"
              >
                {{ category.name }}
              </NuxtLink>
            </h3>
            <p class="hidden text-sm text-zinc-200 sm:block">
              {{ category.summary }}
            </p>
          </div>
          <span
            class="grid size-9 shrink-0 place-items-center rounded-xl bg-zinc-50/15 text-zinc-50 backdrop-blur-sm transition-transform duration-300 motion-safe:group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            <Icon
              name="ph:arrow-up-right"
              class="size-4"
            />
          </span>
        </div>
      </li>
    </ul>
  </section>
</template>
