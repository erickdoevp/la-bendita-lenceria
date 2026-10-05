<script setup lang="ts">
import type { Review } from '~/features/reviews'
import { useMyReviewsStore } from '../stores/my-reviews.store'
import MyReviewCard from './MyReviewCard.vue'
import MyReviewForm from './MyReviewForm.vue'

const store = useMyReviewsStore()
const modalOpen = ref(false)
const editing = ref<Review | null>(null)
const deletingId = ref<string | null>(null)
const actionError = ref<string | null>(null)
const notice = ref<string | null>(null)

onMounted(() => store.load())

function openEdit(review: Review) {
  editing.value = review
  actionError.value = null
  notice.value = null
  modalOpen.value = true
}

function onSaved() {
  modalOpen.value = false
  notice.value = 'Guardamos tus cambios. La reseña se publicará de nuevo cuando la revisemos.'
}

async function onRemove(review: Review) {
  deletingId.value = review.id
  actionError.value = null
  notice.value = null
  try {
    await store.remove(review.id)
  }
  catch (error) {
    actionError.value = parseApiError(error).message
  }
  finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="grid gap-6">
    <UiPageHeader
      title="Mis reseñas"
      description="Lo que opinaste de tus prendas. Las reseñas nuevas o editadas se publican después de revisarlas."
    />

    <UiAlert v-if="actionError || store.error">
      {{ actionError ?? store.error }}
      <button
        v-if="store.error"
        type="button"
        class="ml-1 font-medium underline underline-offset-2"
        @click="store.load()"
      >
        Reintentar
      </button>
    </UiAlert>
    <UiAlert
      v-if="notice"
      tone="info"
    >
      {{ notice }}
    </UiAlert>

    <UiPanel>
      <div
        v-if="store.pending && !store.loaded"
        class="grid gap-4"
      >
        <UiSkeleton
          v-for="n in 3"
          :key="n"
          class="h-24"
        />
      </div>

      <UiEmptyState
        v-else-if="store.loaded && !store.items.length"
        icon="ph:chat-centered-text"
        title="Aún no has escrito reseñas"
        description="Cuando recibas un pedido, cuéntanos qué te pareció desde la página del producto."
      />

      <ul
        v-else
        class="-my-5 divide-y divide-line sm:-my-6"
      >
        <li
          v-for="review in store.items"
          :key="review.id"
          class="py-5 sm:py-6"
        >
          <MyReviewCard
            :review="review"
            :deleting="deletingId === review.id"
            @edit="openEdit(review)"
            @remove="onRemove(review)"
          />
        </li>
      </ul>
    </UiPanel>

    <UiModal
      v-model:open="modalOpen"
      :title="editing ? `Editar reseña de ${editing.productName}` : 'Editar reseña'"
    >
      <MyReviewForm
        v-if="editing"
        :key="editing.id"
        :review="editing"
        @saved="onSaved"
        @cancel="modalOpen = false"
      />
    </UiModal>
  </div>
</template>
