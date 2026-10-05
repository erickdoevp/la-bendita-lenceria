<script setup lang="ts">
import { RatingStars } from '~/features/reviews'
import { FIT_LABELS } from '../constants'
import { useProductReviews } from '../composables/useProductReviews'
import type { ProductRating } from '../types'

const props = defineProps<{
  productId: string
  slug: string
  rating: ProductRating | null
}>()

const { items, totalItems, pending, error, loaded, hasMore, loadMore, retry } = useProductReviews(
  toRef(props, 'productId'),
  toRef(props, 'slug'),
)
</script>

<template>
  <section
    id="resenas"
    aria-labelledby="product-reviews-title"
    class="scroll-mt-24"
  >
    <div class="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16">
      <div class="grid content-start gap-4">
        <h2
          id="product-reviews-title"
          class="text-3xl font-semibold tracking-tight text-ink"
        >
          Reseñas
        </h2>
        <div
          v-if="rating"
          class="grid gap-2"
        >
          <p class="flex items-baseline gap-2">
            <span class="text-5xl font-semibold tracking-tight tabular-nums text-ink">{{ rating.average.toFixed(1) }}</span>
            <span class="text-ink-muted">de 5</span>
          </p>
          <RatingStars
            :rating="rating.average"
            size="md"
          />
          <p class="text-sm text-ink-muted">
            Basado en {{ rating.count }} {{ rating.count === 1 ? 'reseña' : 'reseñas' }}
          </p>
        </div>
        <!-- TODO: formulario de resena (POST /reviews) para clientas con la compra entregada -->
        <p class="max-w-[30ch] text-sm leading-relaxed text-ink-muted">
          Puedes dejar tu reseña desde Mi cuenta cuando recibas tu pedido.
        </p>
      </div>

      <div class="grid content-start gap-6">
        <div
          v-if="!loaded && pending"
          class="grid gap-6"
          aria-hidden="true"
        >
          <div
            v-for="n in 3"
            :key="n"
            class="grid gap-2.5 border-b border-line pb-6"
          >
            <UiSkeleton class="h-4 w-24 rounded-md" />
            <UiSkeleton class="h-5 w-1/2 rounded-md" />
            <UiSkeleton class="h-4 w-full rounded-md" />
          </div>
        </div>

        <UiEmptyState
          v-else-if="loaded && !totalItems"
          icon="ph:chat-circle-text"
          title="Todavía no hay reseñas"
          description="Cuando alguien comparta su experiencia con esta prenda, la verás aquí."
        />

        <ul
          v-else
          class="grid gap-6"
        >
          <li
            v-for="review in items"
            :key="review.id"
            class="grid gap-2.5 border-b border-line pb-6"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <RatingStars :rating="review.rating" />
              <time
                :datetime="review.createdAt"
                class="text-[13px] text-ink-muted"
              >{{ formatDate(review.createdAt) }}</time>
            </div>
            <h3
              v-if="review.title"
              class="font-medium text-ink"
            >
              {{ review.title }}
            </h3>
            <p
              v-if="review.body"
              class="max-w-[65ch] leading-relaxed text-ink-muted"
            >
              {{ review.body }}
            </p>
            <p class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-muted">
              <span class="font-medium text-ink">{{ review.author }}</span>
              <span
                v-if="review.verifiedPurchase"
                class="inline-flex items-center gap-1 text-success"
              >
                <Icon
                  name="ph:seal-check"
                  class="size-4"
                  aria-hidden="true"
                />
                Compra verificada
              </span>
              <span v-if="review.sizePurchased">Talla {{ review.sizePurchased }}</span>
              <span v-if="review.fit">{{ FIT_LABELS[review.fit] }}</span>
            </p>
          </li>
        </ul>

        <div
          v-if="error"
          role="alert"
          class="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {{ error }}
          <UiButton
            variant="secondary"
            size="sm"
            icon="ph:arrow-clockwise"
            @click="retry()"
          >
            Reintentar
          </UiButton>
        </div>

        <UiButton
          v-if="loaded && hasMore && !error"
          variant="secondary"
          class="justify-self-start"
          :loading="pending"
          @click="loadMore()"
        >
          Ver más reseñas
        </UiButton>
      </div>
    </div>
  </section>
</template>
