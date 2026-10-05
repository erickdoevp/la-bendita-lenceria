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
    <div class="col-span-2 flex items-center justify-between gap-3 @min-[42rem]:col-span-1 @min-[42rem]:h-10">
      <span class="inline-flex h-8 min-w-10 items-center justify-center rounded-full bg-surface px-2.5 text-sm font-semibold text-ink">
        {{ sizeName }}
      </span>
      <span class="text-sm tabular-nums text-ink @min-[42rem]:hidden">
        {{ finalPrice === null ? 'Sin precio base' : formatMoney(finalPrice) }}
      </span>
    </div>

    <div class="col-span-2 grid gap-1 @min-[42rem]:col-span-1">
      <label
        :for="id('sku')"
        class="text-xs text-ink-muted @min-[42rem]:sr-only"
      >SKU de {{ label }}</label>
      <UiInput
        :id="id('sku')"
        v-model="variant.sku"
        size="sm"
        class="font-mono"
        :invalid="Boolean(error('sku') || error('sizeId'))"
        :placeholder="draft.skuPreviews[variant.key] ?? 'Automático'"
        autocomplete="off"
        spellcheck="false"
      />
      <p
        v-if="error('sku') || error('sizeId') || error('colorId')"
        class="text-xs text-danger"
      >
        {{ error('sku') ?? error('sizeId') ?? error('colorId') }}
      </p>
    </div>

    <div class="grid gap-1">
      <label
        :for="id('adjustment')"
        class="text-xs text-ink-muted @min-[42rem]:sr-only"
      >Ajuste de precio de {{ label }}</label>
      <UiInput
        :id="id('adjustment')"
        v-model="variant.priceAdjustment"
        size="sm"
        type="number"
        step="0.01"
        inputmode="decimal"
        prefix="$"
        :invalid="Boolean(error('priceAdjustment'))"
      />
      <p
        v-if="error('priceAdjustment')"
        class="text-xs text-danger"
      >
        {{ error('priceAdjustment') }}
      </p>
    </div>

    <div class="grid gap-1">
      <label
        :for="id('cost')"
        class="text-xs text-ink-muted @min-[42rem]:sr-only"
      >Costo de {{ label }}</label>
      <UiInput
        :id="id('cost')"
        v-model="variant.costPrice"
        size="sm"
        type="number"
        min="0"
        step="0.01"
        inputmode="decimal"
        prefix="$"
        :invalid="Boolean(error('costPrice'))"
      />
      <p
        v-if="error('costPrice')"
        class="text-xs text-danger"
      >
        {{ error('costPrice') }}
      </p>
    </div>

    <div class="grid gap-1">
      <label
        :for="id('stock')"
        class="text-xs text-ink-muted @min-[42rem]:sr-only"
      >Stock inicial de {{ label }}</label>
      <UiInput
        :id="id('stock')"
        v-model="variant.initialStock"
        size="sm"
        type="number"
        min="0"
        step="1"
        inputmode="numeric"
        :invalid="Boolean(error('initialStock'))"
      />
      <p
        v-if="error('initialStock')"
        class="text-xs text-danger"
      >
        {{ error('initialStock') }}
      </p>
    </div>

    <p class="hidden h-10 items-center justify-end text-sm tabular-nums text-ink @min-[42rem]:flex">
      <span
        v-if="finalPrice === null"
        class="text-ink-muted"
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
      <button
        type="button"
        class="grid size-9 shrink-0 place-items-center rounded-xl text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-accent"
        :aria-label="`Quitar variante ${label}`"
        @click="draft.removeVariant(variant.key)"
      >
        <Icon
          name="ph:trash"
          class="size-4"
          aria-hidden="true"
        />
      </button>
    </div>
  </li>
</template>
