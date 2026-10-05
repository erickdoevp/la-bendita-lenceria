<script setup lang="ts">
import { STORE_ROUTES } from '../constants'

defineProps<{
  /** Sin "Inicio": se agrega solo. El ultimo elemento es la pagina actual y no lleva enlace. */
  items: { label: string, to?: string }[]
}>()
</script>

<template>
  <nav aria-label="Migas de pan">
    <ol class="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-muted">
      <li>
        <NuxtLink
          :to="STORE_ROUTES.home"
          class="hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          Inicio
        </NuxtLink>
      </li>
      <li
        v-for="(item, index) in items"
        :key="`${index}-${item.label}`"
        class="flex items-center gap-1.5"
      >
        <Icon
          name="ph:caret-right"
          class="size-3"
          aria-hidden="true"
        />
        <NuxtLink
          v-if="item.to && index < items.length - 1"
          :to="item.to"
          class="hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          {{ item.label }}
        </NuxtLink>
        <span
          v-else
          aria-current="page"
          class="text-ink"
        >{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>
