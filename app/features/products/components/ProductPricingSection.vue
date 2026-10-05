<script setup lang="ts">
import type { Category } from '~/features/catalog'
import { CategoryForm, CategorySelect, useCategoriesStore, useTaxesStore } from '~/features/catalog'
import { useProductDraftStore } from '../stores/product-draft.store'

const draft = useProductDraftStore()
const categories = useCategoriesStore()
const taxes = useTaxesStore()

const categoryModal = ref(false)
const inactiveNotice = ref<string | null>(null)

const percent = (rate: number) => `${Number((rate * 100).toFixed(2))} %`

function onCategoryCreated(category: Category) {
  categoryModal.value = false
  // Las inactivas no salen en el arbol, asi que no se pueden asignar todavia
  if (category.active) {
    draft.form.categoryId = category.id
    inactiveNotice.value = null
  }
  else {
    inactiveNotice.value = `${category.name} se creó inactiva. Actívala para poder usarla.`
  }
}
</script>

<template>
  <UiPanel
    title="Precio y clasificación"
    description="El precio de cada variante es el precio base más su ajuste."
  >
    <div class="grid gap-5 md:grid-cols-2">
      <UiField
        id="product-price"
        v-slot="field"
        label="Precio base"
        :error="draft.fieldErrors.basePrice"
      >
        <UiInput
          :id="field.id"
          v-model="draft.form.basePrice"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          type="number"
          min="0"
          step="0.01"
          inputmode="decimal"
          prefix="$"
          placeholder="0.00"
        />
      </UiField>

      <UiField
        id="product-tax"
        v-slot="field"
        label="Impuesto"
        hint="Por defecto, el IVA global activo."
        :error="draft.fieldErrors.taxConfigId"
      >
        <UiSkeleton
          v-if="taxes.status === 'pending'"
          class="h-11"
        />
        <UiSelect
          v-else
          :id="field.id"
          v-model="draft.form.taxConfigId"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
        >
          <option
            v-if="!taxes.items.length"
            value=""
          >
            Sin impuestos configurados
          </option>
          <option
            v-for="tax in taxes.items"
            :key="tax.id"
            :value="tax.id"
          >
            {{ tax.name }} ({{ percent(tax.rate) }}){{ tax.active ? ', global' : '' }}
          </option>
        </UiSelect>
      </UiField>

      <div class="grid gap-2 md:col-span-2">
        <div class="flex items-end justify-between gap-3">
          <label
            for="product-category"
            class="text-sm font-medium text-ink"
          >Categoría</label>
          <UiButton
            v-if="categories.options.length"
            variant="ghost"
            size="sm"
            icon="ph:plus"
            @click="categoryModal = true"
          >
            Nueva categoría
          </UiButton>
        </div>

        <UiSkeleton
          v-if="categories.status === 'pending'"
          class="h-11"
        />
        <UiEmptyState
          v-else-if="categories.status === 'ready' && !categories.options.length"
          icon="ph:tree-structure"
          title="No hay categorías activas"
          description="Todo artículo necesita una categoría. Crea la primera sin salir de aquí."
        >
          <UiButton
            size="sm"
            icon="ph:plus"
            @click="categoryModal = true"
          >
            Crear categoría
          </UiButton>
        </UiEmptyState>
        <CategorySelect
          v-else
          id="product-category"
          v-model="draft.form.categoryId"
          :invalid="Boolean(draft.fieldErrors.categoryId)"
          :aria-describedby="draft.fieldErrors.categoryId ? 'product-category-error' : undefined"
        />

        <p
          v-if="draft.fieldErrors.categoryId"
          id="product-category-error"
          class="text-[13px] text-danger"
        >
          {{ draft.fieldErrors.categoryId }}
        </p>
        <p
          v-else-if="inactiveNotice"
          class="text-[13px] text-ink-muted"
        >
          {{ inactiveNotice }}
        </p>
        <p
          v-else-if="categories.error"
          class="text-[13px] text-danger"
        >
          {{ categories.error }}
        </p>
      </div>
    </div>

    <UiModal
      v-model:open="categoryModal"
      title="Nueva categoría"
      description="Quedará seleccionada para este artículo."
    >
      <CategoryForm @saved="onCategoryCreated" />
    </UiModal>
  </UiPanel>
</template>
