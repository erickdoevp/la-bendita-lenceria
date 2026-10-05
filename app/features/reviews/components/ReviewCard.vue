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
    class="grid gap-3 px-4 py-4 transition-colors sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-4 sm:px-6"
    :class="selected && 'bg-primary/5'"
  >
    <div class="flex items-start gap-3">
      <UCheckbox
        v-if="selectable"
        :model-value="selected"
        class="mt-3"
        :aria-label="`Seleccionar la reseña de ${review.username}`"
        @update:model-value="emit('toggle')"
      />
      <img
        v-if="review.productImageUrl"
        :src="review.productImageUrl"
        alt=""
        loading="lazy"
        class="aspect-[4/5] w-12 shrink-0 rounded-lg border border-default object-cover"
      >
      <span
        v-else
        class="grid aspect-[4/5] w-12 shrink-0 place-items-center rounded-lg bg-muted text-muted"
      >
        <UIcon
          name="ph:image"
          class="size-4"
          aria-hidden="true"
        />
      </span>
    </div>

    <div class="grid min-w-0 content-start gap-2">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <UButton
          color="neutral"
          variant="link"
          :label="review.productName"
          :title="`Ver todas las reseñas de ${review.productName}`"
          class="truncate p-0 font-medium text-highlighted"
          @click="emit('filterProduct')"
        />
        <RatingStars :rating="review.rating" />
      </div>

      <div class="flex flex-wrap items-center gap-1.5 text-xs">
        <span class="text-muted">{{ review.username }} · {{ formatDateTime(review.createdAt) }}</span>
        <UBadge
          v-if="review.verifiedPurchase"
          color="success"
          size="sm"
          icon="ph:seal-check"
          label="Compra verificada"
        />
        <UBadge
          v-if="edited"
          color="neutral"
          size="sm"
          label="Editada"
          :title="`Editada el ${formatDateTime(review.updatedAt)}`"
        />
        <UBadge
          v-if="showStatus"
          :color="review.approved ? 'primary' : 'warning'"
          size="sm"
          :label="review.approved ? 'Publicada' : 'Pendiente'"
        />
      </div>

      <p
        v-if="review.title"
        class="font-medium text-highlighted"
      >
        {{ review.title }}
      </p>
      <p
        v-if="review.body"
        class="whitespace-pre-line text-sm leading-relaxed text-muted"
        :class="longBody && !expanded && 'line-clamp-4'"
      >
        {{ review.body }}
      </p>
      <UButton
        v-if="longBody"
        variant="link"
        size="sm"
        :label="expanded ? 'Ver menos' : 'Leer completa'"
        :aria-expanded="expanded"
        class="justify-self-start px-0"
        @click="expanded = !expanded"
      />
      <p
        v-if="!review.title && !review.body"
        class="text-sm italic text-muted"
      >
        Solo calificación, sin texto.
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
          v-if="!review.approved"
          size="sm"
          icon="ph:check"
          :loading="approving"
          :disabled="deleting"
          label="Aprobar"
          @click="emit('approve')"
        />
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="ph:trash"
          :disabled="approving"
          :label="review.approved ? 'Borrar' : 'Rechazar'"
          @click="confirming = true"
        />
      </template>
    </div>
  </article>
</template>
