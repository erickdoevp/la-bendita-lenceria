<script setup lang="ts">
import type { HomeHeroContent } from '../types'

const props = defineProps<{ content: HomeHeroContent }>()

/** Separa el titulo para pintar la palabra resaltada con el acento. */
const titleParts = computed(() => {
  const { title, highlight } = props.content
  const index = highlight ? title.lastIndexOf(highlight) : -1
  if (index < 0) return { before: title, highlight: '', after: '' }
  return {
    before: title.slice(0, index),
    highlight,
    after: title.slice(index + highlight.length),
  }
})
</script>

<template>
  <section class="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 md:pt-12 lg:min-h-[calc(100dvh-6.5rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 lg:px-10 lg:pb-20">
    <div class="grid justify-items-start gap-6 lg:pb-10">
      <p
        class="hero-enter text-[13px] font-medium uppercase tracking-[0.16em] text-accent"
        style="--i: 0"
      >
        {{ content.eyebrow }}
      </p>
      <h1
        class="hero-enter max-w-[14ch] text-5xl font-semibold leading-[1.02] tracking-tighter text-ink md:text-6xl xl:text-7xl"
        style="--i: 1"
      >
        {{ titleParts.before }}<span class="text-accent">{{ titleParts.highlight }}</span>{{ titleParts.after }}
      </h1>
      <p
        class="hero-enter max-w-[42ch] text-base leading-relaxed text-ink-muted md:text-lg"
        style="--i: 2"
      >
        {{ content.subtitle }}
      </p>
      <div
        class="hero-enter flex flex-wrap gap-3 pt-2"
        style="--i: 3"
      >
        <UiButton
          :to="content.primaryCta.to"
        >
          {{ content.primaryCta.label }}
          <Icon
            name="ph:arrow-right"
            class="size-4"
            aria-hidden="true"
          />
        </UiButton>
        <UiButton
          :to="content.secondaryCta.to"
          variant="secondary"
        >
          {{ content.secondaryCta.label }}
        </UiButton>
      </div>
    </div>

    <div class="relative">
      <div class="hero-media aspect-[4/5] overflow-hidden rounded-2xl bg-line/40 sm:aspect-[5/4] lg:aspect-auto lg:h-[min(76dvh,760px)]">
        <img
          :src="content.image.src"
          :alt="content.image.alt"
          width="1400"
          height="1750"
          fetchpriority="high"
          decoding="async"
          class="size-full object-cover object-[50%_35%]"
        >
      </div>
      <!-- Detalle superpuesto: rompe el borde de la foto principal, solo en pantallas medianas en adelante -->
      <div
        class="hero-detail absolute -bottom-8 -left-8 hidden w-[34%] max-w-60 overflow-hidden rounded-2xl border-[6px] border-surface bg-line/40 md:block lg:-left-14"
      >
        <img
          :src="content.detailImage.src"
          :alt="content.detailImage.alt"
          width="600"
          height="750"
          decoding="async"
          class="aspect-[4/5] size-full object-cover"
        >
      </div>
    </div>
  </section>
</template>
