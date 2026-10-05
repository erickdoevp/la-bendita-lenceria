<script setup lang="ts">
import { useReviewsApi } from '../services'
import type { ReviewStats } from '../types'
import { formatRating } from '../utils/review'
import RatingStars from './RatingStars.vue'

/** Lo que ve la tienda de un articulo: solo cuentan las resenas aprobadas. */
const props = defineProps<{ productId: string }>()

const api = useReviewsApi()
const stats = ref<ReviewStats | null>(null)
const error = ref<string | null>(null)

async function load() {
  error.value = null
  try {
    stats.value = await api.stats(props.productId)
  }
  catch (e) {
    error.value = parseApiError(e).message
  }
}

function percent(count: number) {
  return stats.value?.reviewCount ? Math.round((count / stats.value.reviewCount) * 100) : 0
}

watch(() => props.productId, load, { immediate: true })
defineExpose({ load })
</script>

<template>
  <div class="rounded-xl border border-line p-4">
    <p
      v-if="error"
      class="text-sm text-danger"
    >
      {{ error }}
    </p>
    <div
      v-else-if="!stats"
      class="grid gap-2"
      role="status"
      aria-label="Cargando calificación"
    >
      <UiSkeleton class="h-6 w-24" />
      <UiSkeleton class="h-16" />
    </div>
    <div
      v-else
      class="grid gap-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center"
    >
      <div class="grid gap-1">
        <span class="text-3xl font-semibold tabular-nums tracking-tight text-ink">{{ formatRating(stats.averageRating) }}</span>
        <RatingStars
          :rating="stats.averageRating"
          size="md"
        />
        <span class="text-xs text-ink-muted">
          {{ stats.reviewCount ? `${stats.reviewCount} publicada(s) en la tienda` : 'Sin reseñas publicadas' }}
        </span>
      </div>
      <ul class="grid gap-1">
        <li
          v-for="star in [5, 4, 3, 2, 1]"
          :key="star"
          class="grid grid-cols-[1.5rem_minmax(0,1fr)_2rem] items-center gap-2 text-xs tabular-nums text-ink-muted"
        >
          <span>{{ star }}★</span>
          <span class="h-2 overflow-hidden rounded-full bg-surface">
            <span
              class="block h-full rounded-full bg-warning"
              :style="{ width: `${percent(stats.ratingDistribution[star] ?? 0)}%` }"
            />
          </span>
          <span class="text-right">{{ stats.ratingDistribution[star] ?? 0 }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
