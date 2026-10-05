<script setup lang="ts">
import type { Review } from '../types'
import { isEdited } from '../utils/review'
import RatingStars from './RatingStars.vue'

const props = defineProps<{
  review: Review
  selectable?: boolean
  selected?: boolean
  /** Muestra si esta publicada o pendiente (en la pestana "Todas"). */
  showStatus?: boolean
  approving?: boolean
  deleting?: boolean
}>()
const emit = defineEmits<{
  approve: []
  remove: []
  toggle: []
  filterProduct: []
}>()

const expanded = ref(false)
const confirming = ref(false)
const edited = computed(() => isEdited(props.review))
// El body no tiene limite de largo: se recorta y se ofrece "Leer completa"
const longBody = computed(() => (props.review.body?.length ?? 0) > 280)

watch(() => props.deleting, (value, previous) => {
  if (previous && !value) confirming.value = false
})
</script>

<template>
  <article
    class="grid gap-3 px-5 py-4 transition-colors sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-4 sm:px-6"
    :class="selected && 'bg-accent/5'"
  >
    <div class="flex items-start gap-3">
      <input
        v-if="selectable"
        type="checkbox"
        class="mt-3 size-4 shrink-0 accent-[var(--accent)]"
        :checked="selected"
        :aria-label="`Seleccionar la reseña de ${review.username}`"
        @change="emit('toggle')"
      >
      <img
        v-if="review.productImageUrl"
        :src="review.productImageUrl"
        alt=""
        loading="lazy"
        class="aspect-[4/5] w-12 shrink-0 rounded-lg border border-line object-cover"
      >
      <span
        v-else
        class="grid aspect-[4/5] w-12 shrink-0 place-items-center rounded-lg bg-surface text-ink-muted"
      >
        <Icon
          name="ph:image"
          class="size-4"
          aria-hidden="true"
        />
      </span>
    </div>

    <div class="grid min-w-0 content-start gap-2">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <button
          type="button"
          class="truncate rounded-md font-medium text-ink hover:underline focus-visible:outline-2 focus-visible:outline-accent"
          :title="`Ver todas las reseñas de ${review.productName}`"
          @click="emit('filterProduct')"
        >
          {{ review.productName }}
        </button>
        <RatingStars :rating="review.rating" />
      </div>

      <div class="flex flex-wrap items-center gap-1.5 text-xs">
        <span class="text-ink-muted">{{ review.username }} · {{ formatDateTime(review.createdAt) }}</span>
        <span
          v-if="review.verifiedPurchase"
          class="inline-flex items-center gap-1 rounded-md bg-success-soft px-1.5 py-0.5 font-medium text-success"
        >
          <Icon
            name="ph:seal-check"
            class="size-3.5"
            aria-hidden="true"
          />
          Compra verificada
        </span>
        <span
          v-if="edited"
          class="rounded-md bg-surface px-1.5 py-0.5 font-medium text-ink-muted"
          :title="`Editada el ${formatDateTime(review.updatedAt)}`"
        >Editada</span>
        <span
          v-if="showStatus"
          class="rounded-md px-1.5 py-0.5 font-medium"
          :class="review.approved ? 'bg-accent/10 text-accent' : 'bg-warning-soft text-warning'"
        >{{ review.approved ? 'Publicada' : 'Pendiente' }}</span>
      </div>

      <p
        v-if="review.title"
        class="font-medium text-ink"
      >
        {{ review.title }}
      </p>
      <p
        v-if="review.body"
        class="whitespace-pre-line text-sm leading-relaxed text-ink-muted"
        :class="longBody && !expanded && 'line-clamp-4'"
      >
        {{ review.body }}
      </p>
      <button
        v-if="longBody"
        type="button"
        class="justify-self-start text-[13px] text-accent hover:underline"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Ver menos' : 'Leer completa' }}
      </button>
      <p
        v-if="!review.title && !review.body"
        class="text-sm italic text-ink-muted"
      >
        Solo calificación, sin texto.
      </p>
    </div>

    <div class="flex flex-wrap items-start gap-1.5 sm:flex-col sm:items-end">
      <template v-if="confirming">
        <span class="text-xs text-ink-muted sm:text-right">¿Borrar? No se puede deshacer.</span>
        <div class="flex gap-1.5">
          <UiButton
            variant="danger"
            size="sm"
            :loading="deleting"
            @click="emit('remove')"
          >
            Sí, borrar
          </UiButton>
          <UiButton
            variant="ghost"
            size="sm"
            :disabled="deleting"
            @click="confirming = false"
          >
            No
          </UiButton>
        </div>
      </template>
      <template v-else>
        <UiButton
          v-if="!review.approved"
          size="sm"
          icon="ph:check"
          :loading="approving"
          :disabled="deleting"
          @click="emit('approve')"
        >
          Aprobar
        </UiButton>
        <UiButton
          variant="ghost"
          size="sm"
          icon="ph:trash"
          :disabled="approving"
          @click="confirming = true"
        >
          {{ review.approved ? 'Borrar' : 'Rechazar' }}
        </UiButton>
      </template>
    </div>
  </article>
</template>
