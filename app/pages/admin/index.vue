<script setup lang="ts">
import { useAuthStore } from '~/features/auth'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Panel | La Bendita',
  robots: 'noindex, nofollow',
})

const auth = useAuthStore()

// Orden en que deben existir los catalogos antes del primer articulo
const steps = [
  { to: '/admin/catalog/categories', icon: 'ph:tree-structure', title: 'Categorías', text: 'Obligatoria para cada artículo.' },
  { to: '/admin/catalog/sizes', icon: 'ph:ruler', title: 'Tallas', text: 'Necesarias para armar variantes.' },
  { to: '/admin/catalog/colors', icon: 'ph:palette', title: 'Colores', text: 'Con su código hex para la muestra.' },
  { to: '/admin/products/new', icon: 'ph:coat-hanger', title: 'Nuevo artículo', text: 'Datos, variantes y fotos en un paso.' },
]
</script>

<template>
  <div class="grid gap-10">
    <section class="max-w-2xl">
      <h1 class="text-3xl font-semibold tracking-tight text-ink">
        Hola, {{ auth.user?.name }}
      </h1>
      <p class="mt-3 leading-relaxed text-ink-muted">
        Para dar de alta un artículo, primero deben existir su categoría, sus tallas y sus colores.
      </p>
    </section>

    <ol class="grid gap-3 sm:grid-cols-2">
      <li
        v-for="step in steps"
        :key="step.to"
      >
        <NuxtLink
          :to="step.to"
          class="group flex items-center gap-4 rounded-2xl border border-line bg-surface-raised p-5 transition-colors duration-200 hover:border-ink-muted focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span class="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
            <Icon
              :name="step.icon"
              class="size-5"
              aria-hidden="true"
            />
          </span>
          <span class="grid flex-1 gap-0.5">
            <span class="font-medium text-ink">{{ step.title }}</span>
            <span class="text-sm text-ink-muted">{{ step.text }}</span>
          </span>
          <Icon
            name="ph:arrow-right"
            class="size-4 text-ink-muted transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </NuxtLink>
      </li>
    </ol>
  </div>
</template>
