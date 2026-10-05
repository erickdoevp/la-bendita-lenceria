<script setup lang="ts">
import type { ResolvedCategory, StoreCategory } from '~/features/store-catalog'
import { STORE_ROUTES, StoreBreadcrumbs } from '~/features/store-catalog'

const props = defineProps<{ resolved: ResolvedCategory }>()

const category = computed(() => props.resolved.category)
const trail = computed(() => props.resolved.trail)
const isRoot = computed(() => trail.value.length === 1)

const pathOf = (nodes: StoreCategory[]) => STORE_ROUTES.category(...nodes.map(n => n.slug))

// Accesos rapidos: hijas de la categoria actual o, si es una hoja, sus hermanas
const shortcuts = computed(() => {
  if (category.value.children.length) {
    return {
      parentPath: props.resolved.path,
      parentLabel: 'Todo',
      items: category.value.children.map(child => ({ ...child, path: pathOf([...trail.value, child]) })),
    }
  }
  const parentTrail = trail.value.slice(0, -1)
  const parent = parentTrail.at(-1)
  if (!parent) return null
  return {
    parentPath: pathOf(parentTrail),
    parentLabel: `Todo ${parent.name.toLowerCase()}`,
    items: parent.children.map(sibling => ({ ...sibling, path: pathOf([...parentTrail, sibling]) })),
  }
})

const isCurrent = (path: string) => path === props.resolved.path

const breadcrumbs = computed(() =>
  trail.value.map((node, index) => ({ label: node.name, to: pathOf(trail.value.slice(0, index + 1)) })),
)
</script>

<template>
  <header class="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10 lg:pt-8">
    <StoreBreadcrumbs :items="breadcrumbs" />

    <!-- Las categorias raiz llevan banner con foto; las demas, solo titulo -->
    <div
      v-if="isRoot && category.imageUrl"
      class="mt-5 grid overflow-hidden rounded-2xl bg-surface-raised ring-1 ring-line md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
    >
      <div class="grid content-center gap-3 p-6 md:p-10 lg:p-12">
        <h1 class="text-4xl font-semibold tracking-tighter text-ink md:text-5xl">
          {{ category.name }}
        </h1>
        <p
          v-if="category.summary"
          class="max-w-[42ch] leading-relaxed text-ink-muted"
        >
          {{ category.summary }}
        </p>
      </div>
      <div class="relative order-first aspect-[16/9] bg-line/40 md:order-none md:aspect-auto md:min-h-64 lg:min-h-72">
        <img
          :src="category.imageUrl"
          :alt="category.name"
          width="1600"
          height="900"
          fetchpriority="high"
          decoding="async"
          class="absolute inset-0 size-full object-cover object-[50%_30%]"
        >
      </div>
    </div>

    <h1
      v-else
      class="mt-4 text-3xl font-semibold tracking-tight text-ink md:text-4xl"
    >
      {{ category.name }}
    </h1>

    <nav
      v-if="shortcuts?.items.length"
      :aria-label="`Subcategorías de ${category.name}`"
      class="no-scrollbar -mx-4 mt-6 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
    >
      <ul class="flex w-max gap-2">
        <li>
          <NuxtLink
            :to="shortcuts.parentPath"
            class="inline-flex h-10 items-center whitespace-nowrap rounded-xl border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent"
            :class="isCurrent(shortcuts.parentPath) ? 'border-ink bg-ink text-surface' : 'border-line bg-surface-raised text-ink hover:border-ink/40'"
          >
            {{ shortcuts.parentLabel }}
          </NuxtLink>
        </li>
        <li
          v-for="item in shortcuts.items"
          :key="item.id"
        >
          <NuxtLink
            :to="item.path"
            :aria-current="isCurrent(item.path) ? 'page' : undefined"
            class="inline-flex h-10 items-center whitespace-nowrap rounded-xl border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent"
            :class="isCurrent(item.path) ? 'border-ink bg-ink text-surface' : 'border-line bg-surface-raised text-ink hover:border-ink/40'"
          >
            {{ item.name }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
