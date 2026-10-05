<script setup lang="ts">
import { useProductDraftStore } from '../stores/product-draft.store'
import VariantImageButton from './VariantImageButton.vue'

const props = defineProps<{
  index: number
  sizeName: string
  colorName: string
}>()

const draft = useProductDraftStore()
const variant = computed(() => draft.variants[props.index]!)
const label = computed(() => `${props.colorName} ${props.sizeName}`)
const base = computed(() => `variants[${props.index}]`)
const id = (field: string) => `variant-${variant.value.key}-${field}`.replace(/:/g, '-')
// En la vista de tabla (contenedor ancho) las etiquetas solo quedan para lectores de pantalla
const fieldUi = { label: 'text-xs font-normal text-muted @min-[42rem]:sr-only', error: 'text-xs' }
const error = (field: string) => draft.fieldErrors[`${base.value}.${field}`]

const finalPrice = computed(() => {
  if (draft.form.basePrice === '') return null
  return toNumber(draft.form.basePrice) + toNumber(variant.value.priceAdjustment)
})

watch(() => variant.value.sku, () => draft.clearError(`${base.value}.sku`))
watch(() => variant.value.priceAdjustment, () => draft.clearError(`${base.value}.priceAdjustment`))
watch(() => variant.value.costPrice, () => draft.clearError(`${base.value}.costPrice`))
watch(() => variant.value.initialStock, () => draft.clearError(`${base.value}.initialStock`))
watch(() => variant.value.image, () => draft.clearError(`variantImages[${props.index}]`))
</script>

<template>
  <li class="grid grid-cols-2 gap-3 py-4 @min-[42rem]:grid-cols-[3.5rem_minmax(8rem,1.3fr)_repeat(3,minmax(0,1fr))_5.5rem_7rem] @min-[42rem]:items-start @min-[42rem]:gap-2.5 @min-[42rem]:py-2.5">
    <div class="col-span-2 flex items-center justify-between gap-3 @min-[42rem]:col-span-1 @min-[42rem]:h-8">
      <UBadge
        color="neutral"
        size="lg"
        class="min-w-10 justify-center rounded-full font-semibold"
        :label="sizeName"
      />
      <span class="text-sm tabular-nums text-highlighted @min-[42rem]:hidden">
        {{ finalPrice === null ? 'Sin precio base' : formatMoney(finalPrice) }}
      </span>
    </div>

    <UFormField
      :label="`SKU de ${label}`"
      :error="error('sku') ?? error('sizeId') ?? error('colorId')"
      class="col-span-2 @min-[42rem]:col-span-1"
      :ui="fieldUi"
    >
      <UInput
        v-model="variant.sku"
        :ui="{ base: 'font-mono' }"
        :placeholder="draft.skuPreviews[variant.key] ?? 'Automático'"
        autocomplete="off"
        spellcheck="false"
      />
    </UFormField>

    <UFormField
      :label="`Ajuste de precio de ${label}`"
      :error="error('priceAdjustment')"
      :ui="fieldUi"
    >
      <UInput
        v-model.number="variant.priceAdjustment"
        type="number"
        step="0.01"
        inputmode="decimal"
      >
        <template #leading>
          <span class="text-muted">$</span>
        </template>
      </UInput>
    </UFormField>

    <UFormField
      :label="`Costo de ${label}`"
      :error="error('costPrice')"
      :ui="fieldUi"
    >
      <UInput
        v-model.number="variant.costPrice"
        type="number"
        min="0"
        step="0.01"
        inputmode="decimal"
      >
        <template #leading>
          <span class="text-muted">$</span>
        </template>
      </UInput>
    </UFormField>

    <UFormField
      :label="`Stock inicial de ${label}`"
      :error="error('initialStock')"
      :ui="fieldUi"
    >
      <UInput
        v-model.number="variant.initialStock"
        type="number"
        min="0"
        step="1"
        inputmode="numeric"
      />
    </UFormField>

    <p class="hidden h-8 items-center justify-end text-sm tabular-nums text-highlighted @min-[42rem]:flex">
      <span
        v-if="finalPrice === null"
        class="text-muted"
      >Sin precio</span>
      <template v-else>
        {{ formatMoney(finalPrice) }}
      </template>
    </p>

    <div class="flex items-start justify-end gap-1 self-end @min-[42rem]:self-start">
      <VariantImageButton
        :id="id('image')"
        v-model="variant.image"
        :label="label"
        :error="draft.fieldErrors[`variantImages[${index}]`]"
      />
      <UButton
        color="error"
        variant="ghost"
        icon="ph:trash"
        :aria-label="`Quitar variante ${label}`"
        @click="draft.removeVariant(variant.key)"
      />
    </div>
  </li>
</template>
