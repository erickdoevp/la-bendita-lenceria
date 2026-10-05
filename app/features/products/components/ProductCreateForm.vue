<script setup lang="ts">
import { useCategoriesStore, useColorsStore, useSizesStore, useTaxesStore } from '~/features/catalog'
import { provideProductForm } from '../composables/useProductForm'
import { useProductDraftStore } from '../stores/product-draft.store'
import ProductBasicsSection from './ProductBasicsSection.vue'
import ProductCreatedPanel from './ProductCreatedPanel.vue'
import ProductImagesSection from './ProductImagesSection.vue'
import ProductPricingSection from './ProductPricingSection.vue'
import ProductStatusSection from './ProductStatusSection.vue'
import ProductSubmitBar from './ProductSubmitBar.vue'
import ProductVariantsSection from './ProductVariantsSection.vue'

const draft = useProductDraftStore()
const categories = useCategoriesStore()
const sizes = useSizesStore()
const colors = useColorsStore()
const taxes = useTaxesStore()
const alert = ref<HTMLElement | null>(null)
provideProductForm('create', draft)

// Catalogos en paralelo (checklist sec. 10)
onMounted(() => {
  categories.fetchTree()
  sizes.fetchAll()
  colors.fetchAll()
  taxes.fetchAll()
})

// IVA por defecto: el global activo
watch(() => taxes.activeTax, (tax) => {
  if (tax && !draft.form.taxConfigId) draft.form.taxConfigId = tax.id
}, { immediate: true })

/** Enter en un input no debe crear el articulo por accidente. */
function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (event.key === 'Enter' && target.tagName === 'INPUT') event.preventDefault()
}

async function onSubmit() {
  const ok = await draft.submit()
  await nextTick()
  if (ok) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  const firstInvalid = document.querySelector<HTMLElement>('[aria-invalid="true"]')
  const target = firstInvalid ?? alert.value
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  firstInvalid?.focus({ preventScroll: true })
}

function createAnother() {
  draft.reset()
  if (taxes.activeTax) draft.form.taxConfigId = taxes.activeTax.id
  window.scrollTo({ top: 0 })
}
</script>

<template>
  <ProductCreatedPanel
    v-if="draft.created"
    :product="draft.created"
    @create-another="createAnother"
  />

  <form
    v-else
    class="grid gap-6"
    novalidate
    @submit.prevent="onSubmit"
    @keydown="onKeydown"
  >
    <div
      v-if="draft.formError"
      ref="alert"
    >
      <UAlert
        color="error"
        icon="ph:warning-circle"
        :title="draft.formError"
      />
    </div>

    <ProductBasicsSection />
    <ProductPricingSection />
    <ProductVariantsSection />
    <ProductImagesSection />
    <ProductStatusSection />
    <ProductSubmitBar />
  </form>
</template>
