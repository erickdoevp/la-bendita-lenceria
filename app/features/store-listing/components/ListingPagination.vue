<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { parseListingQuery, serializeListingQuery } from '../utils/query'
import { buildPageItems } from '../utils/pagination'

const props = defineProps<{
  page: number
  totalPages: number
}>()

const route = useRoute()

// Enlaces reales (no botones) para que cada pagina sea navegable e indexable
const linkTo = (page: number): RouteLocationRaw => ({
  path: route.path,
  query: serializeListingQuery({ ...parseListingQuery(route.query), page }),
})

const items = computed(() => buildPageItems(props.page, props.totalPages))
const baseClass = 'grid size-10 place-items-center rounded-xl text-sm font-medium tabular-nums transition-[background-color,color,transform] focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.96]'
</script>

<template>
  <nav
    v-if="totalPages > 1"
    aria-label="Paginación"
    class="flex items-center justify-center gap-1"
  >
    <NuxtLink
      v-if="page > 1"
      :to="linkTo(page - 1)"
      :class="baseClass"
      class="text-ink hover:bg-surface-raised"
      aria-label="Página anterior"
    >
      <Icon
        name="ph:caret-left"
        class="size-4"
        aria-hidden="true"
      />
    </NuxtLink>
    <span
      v-else
      :class="baseClass"
      class="text-ink-muted opacity-40"
      aria-hidden="true"
    >
      <Icon
        name="ph:caret-left"
        class="size-4"
      />
    </span>

    <ol class="flex items-center gap-1">
      <li
        v-for="item in items"
        :key="item.type === 'page' ? item.page : item.key"
      >
        <span
          v-if="item.type === 'gap'"
          class="grid size-10 place-items-center text-ink-muted"
          aria-hidden="true"
        >…</span>
        <span
          v-else-if="item.page === page"
          :class="baseClass"
          class="bg-ink text-surface"
          aria-current="page"
        >{{ item.page }}</span>
        <NuxtLink
          v-else
          :to="linkTo(item.page)"
          :class="baseClass"
          class="text-ink hover:bg-surface-raised"
          :aria-label="`Página ${item.page}`"
        >
          {{ item.page }}
        </NuxtLink>
      </li>
    </ol>

    <NuxtLink
      v-if="page < totalPages"
      :to="linkTo(page + 1)"
      :class="baseClass"
      class="text-ink hover:bg-surface-raised"
      aria-label="Página siguiente"
    >
      <Icon
        name="ph:caret-right"
        class="size-4"
        aria-hidden="true"
      />
    </NuxtLink>
    <span
      v-else
      :class="baseClass"
      class="text-ink-muted opacity-40"
      aria-hidden="true"
    >
      <Icon
        name="ph:caret-right"
        class="size-4"
      />
    </span>
  </nav>
</template>
