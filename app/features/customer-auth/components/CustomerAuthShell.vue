<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="grid min-h-[100dvh] bg-surface lg:grid-cols-[1fr_1.1fr]">
    <!-- TODO: foto de marca (1400x1800) en /public como <NuxtImg> object-cover sobre este panel -->
    <div
      class="relative hidden overflow-hidden bg-accent lg:flex lg:items-end lg:p-16"
      aria-hidden="true"
    >
      <p class="text-7xl font-semibold leading-[0.95] tracking-tighter text-accent-ink xl:text-8xl">
        La Bendita
      </p>
    </div>

    <main class="flex flex-col px-4 py-8 sm:px-10 lg:px-16">
      <NuxtLink
        to="/"
        class="self-start text-lg font-semibold tracking-tight text-ink"
      >
        La Bendita
      </NuxtLink>

      <div class="grid flex-1 content-center py-12">
        <div class="w-full max-w-md">
          <h1 class="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            {{ title }}
          </h1>
          <p class="mt-3 text-[15px] leading-relaxed text-ink-muted">
            {{ description }}
          </p>
          <div class="mt-8">
            <slot />
          </div>
          <div
            v-if="$slots.footer"
            class="mt-8 border-t border-line pt-6 text-sm text-ink-muted"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>

      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 self-start text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <Icon
          name="ph:arrow-left"
          class="size-4"
          aria-hidden="true"
        />
        Volver a la tienda
      </NuxtLink>
    </main>
  </div>
</template>
