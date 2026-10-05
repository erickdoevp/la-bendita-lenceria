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
      <UButton
        :to="COLLECTION_ROUTES.list"
        color="neutral"
        variant="link"
        icon="ph:arrow-left"
        label="Colecciones"
        class="justify-self-start px-0"
      />

      <UPageHeader :ui="{ description: 'font-mono text-sm' }">
        <template #title>
          <span class="flex flex-wrap items-center gap-3">
            {{ collection?.name ?? 'Colección' }}
            <UBadge
              v-if="collection"
              :color="collection.active ? 'success' : 'neutral'"
              :label="collection.active ? 'Visible' : 'Oculta'"
            />
          </span>
        </template>

        <template
          v-if="collection"
          #description
        >
          {{ STORE_COLLECTION_PATH }}/{{ collection.slug }}
        </template>

        <template
          v-if="collection"
          #links
        >
          <UButton
            color="neutral"
            variant="outline"
            :icon="collection.active ? 'ph:eye-slash' : 'ph:eye'"
            :loading="toggling"
            :label="collection.active ? 'Ocultar' : 'Publicar'"
            @click="onToggleActive"
          />
          <UButton
            color="error"
            variant="soft"
            icon="ph:trash"
            :disabled="toggling"
            label="Eliminar"
            @click="deleteOpen = true"
          />
        </template>
      </UPageHeader>
    </div>

    <UAlert
      v-if="error"
      color="error"
      icon="ph:warning-circle"
      :title="error.status === 404 ? 'Esta colección no existe.' : error.message"
      :actions="error.status !== 404 ? retryAction(load) : undefined"
      orientation="horizontal"
    />

    <div
      v-else-if="pending && !collection"
      class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
      role="status"
      aria-label="Cargando colección"
    >
      <USkeleton
        class="h-96 rounded-lg"
      />
      <USkeleton
        class="h-96 rounded-lg"
      />
    </div>

    <template v-else-if="collection">
      <UAlert
        v-if="actionError"
        color="error"
        icon="ph:warning-circle"
        :title="actionError"
      />
      <UAlert
        v-else-if="notice"
        color="primary"
        icon="ph:info"
        :title="notice"
      />

      <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <CollectionProductsPanel
          :products="collection.products"
          :reorder="reorderProducts"
          :remove="removeProducts"
          @add="pickerOpen = true"
        />
        <UCard
          title="Datos"
          class="lg:sticky lg:top-6"
        >
          <CollectionForm
            :key="formKey"
            :collection="collection"
            @saved="onSaved"
            @cancel="formKey++"
          />
        </UCard>
      </div>

      <UModal
        v-model:open="pickerOpen"
        title="Agregar artículos"
        description="Se agregan al final, en el orden en que los elijas. Luego puedes reordenarlos."
      >
        <template #body>
          <CollectionProductPicker
            :existing-ids="collection.products.map(p => p.id)"
            :add="addProducts"
            @done="onProductsAdded"
            @cancel="pickerOpen = false"
          />
      
        </template>
      </UModal>

      <UModal
        v-model:open="deleteOpen"
        :title="`Eliminar ${collection.name}`"
        description="Se borran la colección y su portada. Los artículos no se borran. No se puede deshacer; para ocultarla sin perderla usa Ocultar."
      >
        <template #footer>
          <div class="flex w-full flex-wrap justify-end gap-2">
            <UButton
              color="neutral"
              variant="outline"
              :disabled="deleting"
              label="Cancelar"
              @click="deleteOpen = false"
            />
            <UButton
              color="error"
              variant="soft"
              icon="ph:trash"
              :loading="deleting"
              label="Sí, eliminar"
              @click="onDelete"
            />
          </div>
</template>
      </UModal>
    </template>
  </div>
</template>
