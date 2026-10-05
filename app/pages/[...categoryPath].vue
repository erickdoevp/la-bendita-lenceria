<script setup lang="ts">
import { MAX_CATEGORY_DEPTH, useStoreCategories } from '~/features/store-catalog'
import { CategoryListingView } from '~/features/store-listing'

// Las categorias viven en la raiz de la tienda: /lenceria, /lenceria/brasieres, /lenceria/brasieres/push-up.
// Las rutas fijas (/cuenta, /login, /admin...) tienen prioridad sobre esta.
const route = useRoute()
const categories = await useStoreCategories()

const slugs = computed(() => {
  const param = route.params.categoryPath
  return (Array.isArray(param) ? param : [param]).filter(Boolean) as string[]
})

const resolved = computed(() => categories.resolve(slugs.value))

if (!resolved.value) {
  throw createError({
    statusCode: slugs.value.length > MAX_CATEGORY_DEPTH ? 404 : (categories.error ? 503 : 404),
    message: categories.error ?? 'No encontramos esta página.',
    fatal: true,
  })
}

// Si el usuario navega a una categoria que no existe sin recargar
watch(resolved, (value) => {
  if (!value) showError({ statusCode: 404, message: 'No encontramos esta página.' })
})

// "Push up | Lencería | La Bendita": categoria actual y su raiz, sin repetir
const title = computed(() => {
  const trail = resolved.value?.trail ?? []
  const parts = [...new Set([trail.at(-1)?.name, trail[0]?.name].filter(Boolean))]
  return [...parts, 'La Bendita'].join(' | ')
})

useSeoMeta({
  title,
  description: () => resolved.value?.category.summary
    ?? `Compra ${resolved.value?.category.name.toLowerCase()} en La Bendita. Envíos a todo México.`,
  ogImage: () => resolved.value?.trail[0]?.imageUrl ?? undefined,
})
</script>

<template>
  <CategoryListingView
    v-if="resolved"
    :resolved="resolved"
  />
</template>
