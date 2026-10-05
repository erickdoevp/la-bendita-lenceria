<script setup lang="ts">
import { ACCOUNT_NAV } from '../constants'
import type { AccountNavItem } from '../constants'

const route = useRoute()

function isActive(item: AccountNavItem) {
  return item.exact ? route.path === item.to : route.path.startsWith(item.to)
}
</script>

<template>
  <nav aria-label="Mi cuenta">
    <!-- Movil: pestañas con scroll horizontal; escritorio: lista vertical -->
    <ul class="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:grid lg:gap-0.5 lg:overflow-visible lg:p-0">
      <li
        v-for="item in ACCOUNT_NAV"
        :key="item.to"
        class="shrink-0"
      >
        <NuxtLink
          :to="item.to"
          :aria-current="isActive(item) ? 'page' : undefined"
          class="flex h-10 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary"
          :class="isActive(item) ? 'bg-primary/10 text-highlighted' : 'text-muted hover:bg-default hover:text-highlighted'"
        >
          <UIcon
            :name="item.icon"
            class="size-5 shrink-0"
            :class="isActive(item) && 'text-primary'"
            aria-hidden="true"
          />
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
