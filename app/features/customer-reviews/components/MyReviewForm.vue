<script setup lang="ts">
import type { Review } from '~/features/reviews'
import { REVIEW_TITLE_MAX } from '../constants'
import { reviewSchema } from '../schemas'
import { useMyReviewsStore } from '../stores/my-reviews.store'
import RatingInput from './RatingInput.vue'

const props = defineProps<{ review: Review }>()
const emit = defineEmits<{ saved: [review: Review], cancel: [] }>()

const store = useMyReviewsStore()
const { fieldErrors, formError, validate, applyApiError, clearField } = useFormErrors()
const pending = ref(false)

const values = reactive({
  rating: props.review.rating,
  title: props.review.title ?? '',
  body: props.review.body ?? '',
})

for (const key of Object.keys(values) as (keyof typeof values)[]) {
  watch(() => values[key], () => clearField(key))
}

async function onSubmit() {
  const payload = validate(reviewSchema, values)
  if (!payload) return

  pending.value = true
  try {
    emit('saved', await store.update(props.review.id, payload))
  }
  catch (error) {
    applyApiError(error)
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <form
    class="grid gap-5"
    novalidate
    @submit.prevent="onSubmit"
  >
    <UAlert
      v-if="formError"
      color="error"
      icon="ph:warning-circle"
      :title="formError"
    />

    <UFormField
      label="Calificación"
      :error="fieldErrors.rating"
    >
      <RatingInput
        v-model="values.rating"
        label="Calificación"
        :invalid="Boolean(fieldErrors.rating)"
      />
    </UFormField>

    <UFormField
      label="Título"
      :help="`${values.title.length} / ${REVIEW_TITLE_MAX}`"
      :error="fieldErrors.title"
      hint="Opcional"
    >
      <UInput
        v-model="values.title"
        :maxlength="REVIEW_TITLE_MAX"
      />
    </UFormField>

    <UFormField
      label="Tu opinión"
      :error="fieldErrors.body"
      hint="Opcional"
    >
      <UTextarea
        v-model="values.body"
        :rows="5"
        autoresize
      />
    </UFormField>

    <UAlert
      color="primary"
      icon="ph:info"
      title="Al editarla dejará de mostrarse hasta que la revisemos de nuevo."
    />

    <div class="flex flex-wrap gap-2">
      <UButton
        type="submit"
        :loading="pending"
        label="Guardar y enviar a revisión"
      />
      <UButton
        color="neutral"
        variant="outline"
        :disabled="pending"
        label="Cancelar"
        @click="emit('cancel')"
      />
    </div>
  </form>
</template>
