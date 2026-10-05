<script setup lang="ts">
import { useCollectionDetail } from '../composables/useCollectionDetail'
import { COLLECTION_ROUTES, STORE_COLLECTION_PATH } from '../constants'
import { useCollectionsApi } from '../services'
import { useCollectionsStore } from '../stores/collections.store'
import type { Collection } from '../types'
import CollectionForm from './CollectionForm.vue'
import CollectionProductPicker from './CollectionProductPicker.vue'
import CollectionProductsPanel from './CollectionProductsPanel.vue'

const props = defineProps<{
  collectionId: string
  /** Recien creada: se abre directo el selector de productos (flujo 7.1). */
  created?: boolean
}>()

const api = useCollectionsApi()
const store = useCollectionsStore()
const { collection, pending, error, load, applyCollection, addProducts, removeProducts, reorderProducts } = useCollectionDetail(props.collectionId)

const notice = ref<string | null>(props.created ? 'Colección creada. Ahora agrega sus artículos.' : null)
const actionError = ref<string | null>(null)
const pickerOpen = ref(false)
const toggling = ref(false)
const deleteOpen = ref(false)
const deleting = ref(false)
const formKey = ref(0)

onMounted(async () => {
  await load()
  if (props.created && collection.value) pickerOpen.value = true
})

function onSaved(saved: Collection) {
  // El backend puede normalizar o agregar sufijo: se muestra el slug de la respuesta
  const slugChanged = saved.slug !== collection.value?.slug
  applyCollection(saved)
  actionError.value = null
  notice.value = slugChanged
    ? `Cambios guardados. La URL quedó como ${STORE_COLLECTION_PATH}/${saved.slug}.`
    : 'Cambios guardados.'
}

async function onToggleActive() {
  if (!collection.value) return
  toggling.value = true
  actionError.value = null
  notice.value = null
  try {
    // PUT parcial: solo se manda "active"
    const saved = await api.update(collection.value.id, { active: !collection.value.active }, null)
    applyCollection(saved)
    notice.value = saved.active ? 'La colección ya se ve en la tienda.' : 'La colección quedó oculta en la tienda.'
  }
  catch (e) {
    actionError.value = parseApiError(e).message
  }
  finally {
    toggling.value = false
  }
}

async function onDelete() {
  if (!collection.value) return
  deleting.value = true
  try {
    await store.remove(collection.value.id)
    await navigateTo(COLLECTION_ROUTES.list)
  }
  catch (e) {
    actionError.value = parseApiError(e).message
    deleteOpen.value = false
  }
  finally {
    deleting.value = false
  }
}

function onProductsAdded(count: number) {
  pickerOpen.value = false
  notice.value = count === 1 ? 'Artículo agregado al final.' : `${count} artículos agregados al final.`
}
</script>

<template>
  <div class="grid gap-8">
    <div class="grid gap-3">
      <NuxtLink
        :to="COLLECTION_ROUTES.list"
        class="inline-flex items-center gap-1.5 justify-self-start rounded-md text-sm text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
      >
        <Icon
          name="ph:arrow-left"
          class="size-4"
          aria-hidden="true"
        />
        Colecciones
      </NuxtLink>

      <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="grid gap-2">
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              {{ collection?.name ?? 'Colección' }}
            </h1>
            <span
              v-if="collection"
              class="inline-flex rounded-lg px-2 py-1 text-xs font-medium"
              :class="collection.active ? 'bg-success-soft text-success' : 'bg-surface text-ink-muted'"
            >{{ collection.active ? 'Visible' : 'Oculta' }}</span>
          </div>
          <p
            v-if="collection"
            class="font-mono text-sm text-ink-muted"
          >
            {{ STORE_COLLECTION_PATH }}/{{ collection.slug }}
          </p>
        </div>

        <div
          v-if="collection"
          class="flex flex-wrap gap-2"
        >
          <UiButton
            variant="secondary"
            :icon="collection.active ? 'ph:eye-slash' : 'ph:eye'"
            :loading="toggling"
            @click="onToggleActive"
          >
            {{ collection.active ? 'Ocultar' : 'Publicar' }}
          </UiButton>
          <UiButton
            variant="danger"
            icon="ph:trash"
            :disabled="toggling"
            @click="deleteOpen = true"
          >
            Eliminar
          </UiButton>
        </div>
      </header>
    </div>

    <UiAlert v-if="error">
      {{ error.status === 404 ? 'Esta colección no existe.' : error.message }}
      <button
        v-if="error.status !== 404"
        type="button"
        class="ml-1 font-medium underline underline-offset-2"
        @click="load"
      >
        Reintentar
      </button>
    </UiAlert>

    <div
      v-else-if="pending && !collection"
      class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
      role="status"
      aria-label="Cargando colección"
    >
      <UiSkeleton class="h-96 rounded-2xl" />
      <UiSkeleton class="h-96 rounded-2xl" />
    </div>

    <template v-else-if="collection">
      <UiAlert v-if="actionError">
        {{ actionError }}
      </UiAlert>
      <UiAlert
        v-else-if="notice"
        tone="info"
      >
        {{ notice }}
      </UiAlert>

      <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <CollectionProductsPanel
          :products="collection.products"
          :reorder="reorderProducts"
          :remove="removeProducts"
          @add="pickerOpen = true"
        />
        <UiPanel
          title="Datos"
          class="lg:sticky lg:top-6"
        >
          <CollectionForm
            :key="formKey"
            :collection="collection"
            @saved="onSaved"
            @cancel="formKey++"
          />
        </UiPanel>
      </div>

      <UiModal
        v-model:open="pickerOpen"
        title="Agregar artículos"
        description="Se agregan al final, en el orden en que los elijas. Luego puedes reordenarlos."
      >
        <CollectionProductPicker
          :existing-ids="collection.products.map(p => p.id)"
          :add="addProducts"
          @done="onProductsAdded"
          @cancel="pickerOpen = false"
        />
      </UiModal>

      <UiModal
        v-model:open="deleteOpen"
        :title="`Eliminar ${collection.name}`"
        description="Se borran la colección y su portada. Los artículos no se borran. No se puede deshacer; para ocultarla sin perderla usa Ocultar."
      >
        <div class="flex flex-wrap justify-end gap-2">
          <UiButton
            variant="secondary"
            :disabled="deleting"
            @click="deleteOpen = false"
          >
            Cancelar
          </UiButton>
          <UiButton
            variant="danger"
            icon="ph:trash"
            :loading="deleting"
            @click="onDelete"
          >
            Sí, eliminar
          </UiButton>
        </div>
      </UiModal>
    </template>
  </div>
</template>
