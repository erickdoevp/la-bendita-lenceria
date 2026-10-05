<script setup lang="ts">
import { STORE_ROUTES, useStoreCategoriesStore } from '~/features/store-catalog'

const emit = defineEmits<{ close: [] }>()

// El arbol ya lo cargo la cabecera; aqui solo se leen las raices
const categories = useStoreCategoriesStore()
const roots = computed(() => categories.tree.map(node => ({ id: node.id, name: node.name, to: STORE_ROUTES.category(node.slug) })))
</script>

<template>
  <div class="grid content-center gap-8 px-5 py-12 text-center">
    <div class="grid justify-items-center gap-4">
      <span class="grid size-14 place-items-center rounded-2xl bg-accent/8 text-accent">
        <Icon
          name="ph:handbag-bold"
          class="size-6"
          aria-hidden="true"
        />
      </span>
      <div class="grid gap-1.5">
        <p class="text-lg font-semibold tracking-tight text-ink">
          Tu bolsa está vacía
        </p>
        <p class="mx-auto max-w-[32ch] text-sm leading-relaxed text-ink-muted">
          Lo que agregues se queda guardado aquí aunque cierres la página.
        </p>
      </div>
      <UiButton
        :to="STORE_ROUTES.newArrivals"
        class="mt-2"
        @click="emit('close')"
      >
        Ver novedades
      </UiButton>
    </div>

    <nav
      v-if="roots.length"
      aria-label="Categorías"
      class="grid gap-3 border-t border-line pt-8"
    >
      <p class="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-muted">
        O explora por categoría
      </p>
      <ul class="flex flex-wrap justify-center gap-2">
        <li
          v-for="root in roots"
          :key="root.id"
        >
          <NuxtLink
            :to="root.to"
            class="inline-flex h-9 items-center rounded-lg border border-line px-3.5 text-sm text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
            @click="emit('close')"
          >
            {{ root.name }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>
