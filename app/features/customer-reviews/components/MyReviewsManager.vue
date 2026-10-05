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
    <UPageHeader
      title="Mis reseñas"
      description="Lo que opinaste de tus prendas. Las reseñas nuevas o editadas se publican después de revisarlas."
    />

    <UAlert
      v-if="actionError || store.error"
      color="error"
      icon="ph:warning-circle"
      :title="actionError ?? store.error ?? undefined"
      :actions="store.error ? retryAction(() => store.load()) : undefined"
      orientation="horizontal"
    />
    <UAlert
      v-if="notice"
      color="primary"
      icon="ph:info"
      :title="notice"
    />

    <UCard>
      <div
        v-if="store.pending && !store.loaded"
        class="grid gap-4"
      >
        <USkeleton
          v-for="n in 3"
          :key="n"
          class="h-24"
        />
      </div>

      <UEmpty
        v-else-if="store.loaded && !store.items.length"
        icon="ph:chat-centered-text"
        title="Aún no has escrito reseñas"
        description="Cuando recibas un pedido, cuéntanos qué te pareció desde la página del producto."
      />

      <ul
        v-else
        class="-my-5 divide-y divide-default sm:-my-6"
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
    </UCard>

    <UModal
      v-model:open="modalOpen"
      :title="editing ? `Editar reseña de ${editing.productName}` : 'Editar reseña'"
    >
      <template #body>
        <MyReviewForm
          v-if="editing"
          :key="editing.id"
          :review="editing"
          @saved="onSaved"
          @cancel="modalOpen = false"
        />
    
      </template>
    </UModal>
  </div>
</template>
