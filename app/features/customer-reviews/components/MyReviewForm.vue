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
const uid = useId()
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
    <UiAlert v-if="formError">
      {{ formError }}
    </UiAlert>

    <UiField
      :id="`${uid}-rating`"
      v-slot="field"
      label="Calificación"
      :error="fieldErrors.rating"
    >
      <RatingInput
        :id="field.id"
        v-model="values.rating"
        :invalid="field.invalid"
        :described-by="field.describedBy"
      />
    </UiField>

    <UiField
      :id="`${uid}-title`"
      v-slot="field"
      label="Título"
      optional
      :hint="`${values.title.length} / ${REVIEW_TITLE_MAX}`"
      :error="fieldErrors.title"
    >
      <UiInput
        :id="field.id"
        v-model="values.title"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        :maxlength="REVIEW_TITLE_MAX"
      />
    </UiField>

    <UiField
      :id="`${uid}-body`"
      v-slot="field"
      label="Tu opinión"
      optional
      :error="fieldErrors.body"
    >
      <UiTextarea
        :id="field.id"
        v-model="values.body"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        rows="5"
      />
    </UiField>

    <UiAlert tone="info">
      Al editarla dejará de mostrarse hasta que la revisemos de nuevo.
    </UiAlert>

    <div class="flex flex-wrap gap-2">
      <UiButton
        type="submit"
        :loading="pending"
      >
        Guardar y enviar a revisión
      </UiButton>
      <UiButton
        variant="secondary"
        :disabled="pending"
        @click="emit('cancel')"
      >
        Cancelar
      </UiButton>
    </div>
  </form>
</template>
