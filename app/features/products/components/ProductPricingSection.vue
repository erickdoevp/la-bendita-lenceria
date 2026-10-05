<script setup lang="ts">
import type { Category } from '~/features/catalog'
import { CategoryForm, CategorySelect, useCategoriesStore, useTaxesStore } from '~/features/catalog'
import { useProductForm } from '../composables/useProductForm'

const product = useProductForm()
const categories = useCategoriesStore()
const taxes = useTaxesStore()

const categoryModal = ref(false)
const inactiveNotice = ref<string | null>(null)

const percent = (rate: number) => `${Number((rate * 100).toFixed(2))} %`

const taxItems = computed(() => taxes.items.map(tax => ({
  label: `${tax.name} (${percent(tax.rate)})${tax.active ? ', global' : ''}`,
  value: tax.id,
})))

function onCategoryCreated(category: Category) {
  categoryModal.value = false
  // Las inactivas no salen en el arbol, asi que no se pueden asignar todavia
  if (category.active) {
    product.form.categoryId = category.id
    inactiveNotice.value = null
  }
  else {
    inactiveNotice.value = `${category.name} se creó inactiva. Actívala para poder usarla.`
  }
}
</script>

<template>
  <UCard
    title="Precio y clasificación"
    description="El precio de cada variante es el precio base más su ajuste."
  >
    <div class="grid gap-5 md:grid-cols-2">
      <UFormField
        label="Precio base"
        :error="product.fieldErrors.basePrice"
      >
        <UInput
          v-model.number="product.form.basePrice"
          type="number"
          min="0"
          step="0.01"
          inputmode="decimal"
          placeholder="0.00"
        >
          <template #leading>
            <span class="text-muted">$</span>
          </template>
        </UInput>
      </UFormField>

      <UFormField
        label="Impuesto"
        help="Por defecto, el IVA global activo."
        :error="product.fieldErrors.taxConfigId"
      >
        <USkeleton
          v-if="taxes.status === 'pending'"
          class="h-8"
        />
        <USelect
          v-else
          v-model="product.form.taxConfigId"
          :items="taxItems"
          :placeholder="taxes.items.length ? 'Elige un impuesto' : 'Sin impuestos configurados'"
          :disabled="!taxes.items.length"
        />
      </UFormField>

      <UFormField
        label="Categoría"
        class="md:col-span-2"
        :error="product.fieldErrors.categoryId"
        :help="inactiveNotice ?? undefined"
      >
        <template
          v-if="categories.options.length"
          #hint
        >
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            icon="ph:plus"
            label="Nueva categoría"
            @click="categoryModal = true"
          />
        </template>

        <USkeleton
          v-if="categories.status === 'pending'"
          class="h-8"
        />
        <UEmpty
          v-else-if="categories.status === 'ready' && !categories.options.length"
          icon="ph:tree-structure"
          title="No hay categorías activas"
          description="Todo artículo necesita una categoría. Crea la primera sin salir de aquí."
          variant="outline"
        >
          <template #actions>
            <UButton
              size="sm"
              icon="ph:plus"
              label="Crear categoría"
              @click="categoryModal = true"
            />
          </template>
        </UEmpty>
        <CategorySelect
          v-else
          v-model="product.form.categoryId"
        />

        <p
          v-if="categories.error"
          class="mt-2 text-sm text-error"
        >
          {{ categories.error }}
        </p>
      </UFormField>
    </div>

    <UModal
      v-model:open="categoryModal"
      title="Nueva categoría"
      description="Quedará seleccionada para este artículo."
    >
      <template #body>
        <CategoryForm @saved="onCategoryCreated" />
      </template>
    </UModal>
  </UCard>
</template>
