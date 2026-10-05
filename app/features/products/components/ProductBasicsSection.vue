<script setup lang="ts">
import { useProductDraftStore } from '../stores/product-draft.store'

const draft = useProductDraftStore()
const slugPreview = computed(() => slugify(draft.form.name))
</script>

<template>
  <UiPanel
    title="Información básica"
    description="Lo que ve la clienta en la ficha del artículo."
  >
    <div class="grid gap-5">
      <UiField
        id="product-name"
        v-slot="field"
        label="Nombre"
        :error="draft.fieldErrors.name"
      >
        <UiInput
          :id="field.id"
          v-model="draft.form.name"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          placeholder="Bralette de encaje Aurora"
          autocomplete="off"
        />
      </UiField>

      <UiField
        id="product-slug"
        v-slot="field"
        label="Slug (URL)"
        optional
        :hint="`Si lo dejas vacío queda como /${slugPreview || 'nombre-del-articulo'}. Si ya existe se agrega -2.`"
        :error="draft.fieldErrors.slug"
      >
        <UiInput
          :id="field.id"
          v-model="draft.form.slug"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          :placeholder="slugPreview || 'bralette-encaje-aurora'"
          autocomplete="off"
          spellcheck="false"
        />
      </UiField>

      <UiField
        id="product-description"
        v-slot="field"
        label="Descripción"
        optional
        hint="Materiales, ajuste y cuidados. Separa párrafos con una línea en blanco."
        :error="draft.fieldErrors.description"
      >
        <UiTextarea
          :id="field.id"
          v-model="draft.form.description"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          rows="5"
        />
      </UiField>
    </div>
  </UiPanel>
</template>
