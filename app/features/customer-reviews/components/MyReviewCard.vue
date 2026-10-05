<script setup lang="ts">
import { RatingStars } from '~/features/reviews'
import type { Review } from '~/features/reviews'
import { PRODUCT_ROUTE } from '../constants'

const props = defineProps<{
  review: Review
  deleting?: boolean
}>()
const emit = defineEmits<{ edit: [], remove: [] }>()

const confirming = ref(false)

watch(() => props.deleting, (value, previous) => {
  if (previous && !value) confirming.value = false
})
</script>

<template>
  <article class="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-5">
    <NuxtLink
      :to="PRODUCT_ROUTE(review.productSlug)"
      class="w-16 shrink-0"
      tabindex="-1"
      aria-hidden="true"
    >
      <img
        v-if="review.productImageUrl"
        :src="review.productImageUrl"
        alt=""
        loading="lazy"
        class="aspect-[4/5] w-full rounded-lg border border-default object-cover"
      >
      <span
        v-else
        class="grid aspect-[4/5] w-full place-items-center rounded-lg bg-muted text-muted"
      >
        <UIcon
          name="ph:image"
          class="size-5"
        />
      </span>
    </NuxtLink>

    <div class="grid min-w-0 content-start gap-2">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <NuxtLink
          :to="PRODUCT_ROUTE(review.productSlug)"
          class="font-medium text-highlighted underline-offset-2 hover:underline"
        >
          {{ review.productName }}
        </NuxtLink>
        <span
          class="rounded-md px-1.5 py-0.5 text-xs font-medium"
          :class="review.approved ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'"
        >{{ review.approved ? 'Publicada' : 'En revisión' }}</span>
      </div>
      <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
        <RatingStars :rating="review.rating" />
        <span>{{ formatDateTime(review.updatedAt) }}</span>
        <span
          v-if="review.verifiedPurchase"
          class="inline-flex items-center gap-1 text-success"
        >
          <UIcon
            name="ph:seal-check"
            class="size-3.5"
            aria-hidden="true"
          />
          Compra verificada
        </span>
      </div>
      <p
        v-if="review.title"
        class="font-medium text-highlighted"
      >
        {{ review.title }}
      </p>
      <p
        v-if="review.body"
        class="line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-muted"
      >
        {{ review.body }}
      </p>
    </div>

    <div class="flex flex-wrap items-start gap-1.5 sm:flex-col sm:items-end">
      <template v-if="confirming">
        <span class="text-xs text-muted sm:text-right">¿Borrar? No se puede deshacer.</span>
        <div class="flex gap-1.5">
          <UButton
            color="error"
            variant="soft"
            size="sm"
            :loading="deleting"
            label="Sí, borrar"
            @click="emit('remove')"
          />
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            :disabled="deleting"
            label="No"
            @click="confirming = false"
          />
        </div>
      </template>
      <template v-else>
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          icon="ph:pencil-simple"
          label="Editar"
          @click="emit('edit')"
        />
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="ph:trash"
          label="Borrar"
          @click="confirming = true"
        />
      </template>
    </div>
  </article>
</template>
