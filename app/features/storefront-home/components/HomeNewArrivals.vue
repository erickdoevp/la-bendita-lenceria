<script setup lang="ts">
import { ProductRail, STORE_ROUTES } from '~/features/store-catalog'
import { useLatestProducts } from '../composables/useHomeSection'
import HomeSectionError from './HomeSectionError.vue'

const { data: products, loading, errorMessage, refresh } = useLatestProducts()
</script>

<template>
  <ProductRail
    class="py-16 lg:py-24"
    title="Recién llegados"
    title-id="home-new-title"
    :products="products ?? null"
    :loading="loading"
    :eager-count="2"
  >
    <template #actions>
      <NuxtLink
        :to="STORE_ROUTES.newArrivals"
        class="mr-2 inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-ink underline-offset-4 hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-accent"
      >
        Ver novedades
        <Icon
          name="ph:arrow-right"
          class="size-4"
          aria-hidden="true"
        />
      </NuxtLink>
    </template>
    <template #fallback>
      <HomeSectionError
        v-if="errorMessage"
        :message="errorMessage"
        @retry="refresh()"
      />
      <UiEmptyState
        v-else
        icon="ph:t-shirt"
        title="Aún no hay novedades"
        description="Cuando publiquemos nuevas piezas aparecerán aquí. Mientras tanto, explora las categorías."
      />
    </template>
  </ProductRail>
</template>
