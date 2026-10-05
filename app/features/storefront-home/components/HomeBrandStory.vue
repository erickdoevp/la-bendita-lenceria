<script setup lang="ts">
import { STORE_ROUTES } from '~/features/store-catalog'
import { HOME_PROMISES } from '../constants'
import { MOCK_IMAGES } from '../mocks/images'
</script>

<template>
  <section
    aria-labelledby="home-story-title"
    class="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center lg:gap-20 lg:px-10 lg:py-28"
  >
    <div class="reveal relative aspect-[4/5] overflow-hidden rounded-2xl bg-line/40 md:aspect-[3/4]">
      <!-- TODO: foto propia de la marca -->
      <img
        :src="MOCK_IMAGES.storyPortrait"
        alt="Mujer con bralette de encaje negro"
        loading="lazy"
        decoding="async"
        width="1000"
        height="1300"
        class="size-full object-cover"
      >
    </div>

    <div class="grid gap-10">
      <div class="grid gap-5">
        <h2
          id="home-story-title"
          class="reveal max-w-[18ch] text-3xl font-semibold leading-[1.1] tracking-tight text-ink md:text-5xl"
        >
          Lencería para tu cuerpo real, no para el de catálogo
        </h2>
        <p class="reveal max-w-[52ch] text-base leading-relaxed text-ink-muted md:text-lg">
          Elegimos telas suaves, costuras planas y tallas que sí corresponden. Si algo no te queda, lo cambiamos.
        </p>
        <NuxtLink
          :to="STORE_ROUTES.sizeGuide"
          class="reveal inline-flex items-center gap-1.5 justify-self-start text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Consulta la guía de tallas
          <Icon
            name="ph:arrow-right"
            class="size-4"
            aria-hidden="true"
          />
        </NuxtLink>
      </div>

      <ul class="grid gap-x-8 gap-y-7 border-t border-line pt-8 sm:grid-cols-2">
        <li
          v-for="(promise, index) in HOME_PROMISES"
          :key="promise.title"
          class="reveal grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4"
          :style="{ '--i': index }"
        >
          <span class="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
            <Icon
              :name="promise.icon"
              class="size-5"
              aria-hidden="true"
            />
          </span>
          <div class="grid gap-1">
            <h3 class="font-medium text-ink">
              {{ promise.title }}
            </h3>
            <p class="text-sm leading-relaxed text-ink-muted">
              {{ promise.description }}
            </p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
