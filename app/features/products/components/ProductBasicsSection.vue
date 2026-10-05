<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'
import { useProductForm } from '../composables/useProductForm'

const product = useProductForm()
const slugPreview = computed(() => slugify(product.form.name))
const slugHelp = computed(() => (product.mode === 'create'
  ? `Si lo dejas vacío queda como /${slugPreview.value || 'nombre-del-articulo'}. Si ya existe se agrega -2.`
  // El backend regenera el slug al renombrar si no se manda uno distinto al actual
  : 'Cambiarlo rompe los enlaces ya compartidos. Si cambias el nombre y no tocas el slug, se genera uno nuevo.'))

// Formato corto: la ficha del articulo no necesita titulos grandes, citas ni codigo
const toolbarItems: EditorToolbarItem[][] = [
  [
    { kind: 'mark', mark: 'bold', icon: 'ph:text-b', tooltip: { text: 'Negrita' } },
    { kind: 'mark', mark: 'italic', icon: 'ph:text-italic', tooltip: { text: 'Cursiva' } },
    { kind: 'mark', mark: 'underline', icon: 'ph:text-underline', tooltip: { text: 'Subrayado' } },
  ],
  [
    { kind: 'heading', level: 3, icon: 'ph:text-h-three', tooltip: { text: 'Subtítulo' } },
    { kind: 'bulletList', icon: 'ph:list-bullets', tooltip: { text: 'Lista' } },
    { kind: 'orderedList', icon: 'ph:list-numbers', tooltip: { text: 'Lista numerada' } },
  ],
  [
    { kind: 'undo', icon: 'ph:arrow-counter-clockwise', tooltip: { text: 'Deshacer' } },
    { kind: 'redo', icon: 'ph:arrow-clockwise', tooltip: { text: 'Rehacer' } },
  ],
]
</script>

<template>
  <UCard
    title="Información básica"
    description="Lo que ve la clienta en la ficha del artículo."
  >
    <div class="grid gap-5">
      <UFormField
        label="Nombre"
        :error="product.fieldErrors.name"
      >
        <UInput
          v-model="product.form.name"
          placeholder="Bralette de encaje Aurora"
          autocomplete="off"
        />
      </UFormField>

      <UFormField
        label="Slug (URL)"
        :help="slugHelp"
        :error="product.fieldErrors.slug"
        :hint="product.mode === 'create' ? 'Opcional' : undefined"
      >
        <UInput
          v-model="product.form.slug"
          :placeholder="slugPreview || 'bralette-encaje-aurora'"
          autocomplete="off"
          spellcheck="false"
        />
      </UFormField>

      <UFormField
        label="Descripción"
        help="Materiales, ajuste y cuidados."
        :error="product.fieldErrors.description"
        hint="Opcional"
      >
        <UEditor
          v-slot="{ editor }"
          v-model="product.form.description"
          content-type="json"
          :starter-kit="{ blockquote: false, code: false, codeBlock: false, horizontalRule: false, link: false }"
          :image="false"
          :mention="false"
          placeholder="Bralette de encaje elástico con varilla suave…"
          class="rounded-md border border-default focus-within:border-primary"
          :ui="{ content: 'min-h-36', base: 'px-3 py-2 sm:px-3 *:my-2' }"
        >
          <UEditorToolbar
            :editor="editor"
            :items="toolbarItems"
            class="border-b border-default px-1 py-1"
          />
        </UEditor>
      </UFormField>
    </div>
  </UCard>
</template>
