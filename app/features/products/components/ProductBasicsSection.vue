<script setup lang="ts">
import { useProductDraftStore } from '../stores/product-draft.store'

const draft = useProductDraftStore()
const slugPreview = computed(() => slugify(draft.form.name))
</script>

<template>
  <UCard
    title="Información básica"
    description="Lo que ve la clienta en la ficha del artículo."
  >
    <div class="grid gap-5">
      <UFormField
        label="Nombre"
        :error="draft.fieldErrors.name"
      >
        <UInput
          v-model="draft.form.name"
          placeholder="Bralette de encaje Aurora"
          autocomplete="off"
        />
      </UFormField>

      <UFormField
        label="Slug (URL)"
        :help="`Si lo dejas vacío queda como /${slugPreview || 'nombre-del-articulo'}. Si ya existe se agrega -2.`"
        :error="draft.fieldErrors.slug"
        hint="Opcional"
      >
        <UInput
          v-model="draft.form.slug"
          :placeholder="slugPreview || 'bralette-encaje-aurora'"
          autocomplete="off"
          spellcheck="false"
        />
      </UFormField>

      <UFormField
        label="Descripción"
        help="Materiales, ajuste y cuidados. Separa párrafos con una línea en blanco."
        :error="draft.fieldErrors.description"
        hint="Opcional"
      >
        <UTextarea
          v-model="draft.form.description"
          :rows="5"
          autoresize
        />
      </UFormField>
    </div>
  </UCard>
</template>
