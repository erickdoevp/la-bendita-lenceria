<script setup lang="ts">
import { ColorSwatch, useColorsStore, useSizesStore } from '~/features/catalog'
import { variantSchema, variantUpdateSchema } from '../schemas'
import { useProductsApi } from '../services'
import { useProductEditStore } from '../stores/product-edit.store'
import type { VariantUpdateRequest } from '../types'
import VariantImageButton from './VariantImageButton.vue'

/** Sin variantId se agrega una variante nueva. */
const props = defineProps<{ variantId: string | null }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ saved: [message: string] }>()

const store = useProductEditStore()
const sizes = useSizesStore()
const colors = useColorsStore()
const api = useProductsApi()
const { fieldErrors, formError, validate, applyApiError, clearField, reset: resetErrors } = useFormErrors()

const product = computed(() => store.product!)
// Se lee del detalle para ver la foto propia al dia tras quitarla
const variant = computed(() => product.value.variants.find(v => v.id === props.variantId) ?? null)
const label = computed(() => (variant.value ? `${variant.value.color.name} ${variant.value.size.name}` : 'variante nueva'))

const emptyState = () => ({
  sizeId: '',
  colorId: '',
  sku: '',
  priceAdjustment: 0 as number | string,
  costPrice: 0 as number | string,
  initialStock: 0 as number | string,
  active: true,
  image: null as File | null,
})
const state = reactive(emptyState())
const saving = ref(false)
const removingImage = ref(false)
const confirmingDelete = ref(false)
const deleting = ref(false)
const skuPreview = ref<string | null>(null)

const sizeItems = computed(() => sizes.items.map(s => ({ label: s.name, value: s.id })))
const colorItems = computed(() => colors.items.map(c => ({ label: c.name, value: c.id, hex: c.hex })))
const finalPrice = computed(() => product.value.basePrice + toNumber(state.priceAdjustment))

watch(open, (isOpen) => {
  if (!isOpen) return
  const v = variant.value
  Object.assign(state, emptyState(), v
    ? { sizeId: v.size.id, colorId: v.color.id, sku: v.sku, priceAdjustment: v.priceAdjustment, costPrice: v.costPrice, active: v.active }
    : {})
  resetErrors()
  confirmingDelete.value = false
  skuPreview.value = null
}, { immediate: true })

for (const field of ['sizeId', 'colorId', 'sku', 'priceAdjustment', 'costPrice', 'initialStock'] as const) {
  watch(() => state[field], () => clearField(field))
}

// Vista previa del SKU que generaria el backend (solo al agregar)
watch(() => [state.sizeId, state.colorId], async ([sizeId, colorId]) => {
  skuPreview.value = null
  if (variant.value || !sizeId || !colorId) return
  try {
    skuPreview.value = (await api.variantSkuPreview(product.value.id, { sizeId, colorId })).sku
  }
  catch {
    // Sin vista previa: el SKU se genera igual al guardar
  }
})

function priceError() {
  return finalPrice.value <= 0 ? { priceAdjustment: 'El precio final debe ser mayor a 0.' } : null
}

async function create() {
  const data = validate(variantSchema, state)
  if (!data) return
  const duplicate = product.value.variants.some(v => v.size.id === data.sizeId && v.color.id === data.colorId)
  const errors = {
    ...(duplicate ? { sizeId: 'Ya existe una variante con esta talla y color.' } : {}),
    ...priceError(),
  }
  if (Object.keys(errors).length) {
    fieldErrors.value = errors
    return
  }
  await api.addVariant(product.value.id, data, state.image)
  await store.refresh()
  emit('saved', 'Variante agregada.')
}

async function update() {
  const current = variant.value!
  const data = validate(variantUpdateSchema, state)
  if (!data) return
  const price = priceError()
  if (price) {
    fieldErrors.value = price
    return
  }
  const patch: VariantUpdateRequest = {}
  if (data.sku !== current.sku) patch.sku = data.sku
  if (data.priceAdjustment !== current.priceAdjustment) patch.priceAdjustment = data.priceAdjustment
  if (data.costPrice !== current.costPrice) patch.costPrice = data.costPrice
  if (data.active !== current.active) patch.active = data.active
  if (!Object.keys(patch).length && !state.image) {
    open.value = false
    return
  }
  await api.updateVariant(product.value.id, current.id, patch, state.image)
  await store.refresh()
  emit('saved', `${label.value}: cambios guardados.`)
}

async function onSubmit() {
  formError.value = null
  saving.value = true
  try {
    await (variant.value ? update() : create())
  }
  catch (e) {
    applyApiError(e, { conflict: 'Ese SKU ya lo usa otra variante. Cámbialo o déjalo vacío para generarlo.' })
  }
  finally {
    saving.value = false
  }
}

async function removeImage() {
  if (!variant.value) return
  removingImage.value = true
  formError.value = null
  try {
    await api.removeVariantImage(product.value.id, variant.value.id)
    await store.refresh()
  }
  catch (e) {
    formError.value = parseApiError(e).message
  }
  finally {
    removingImage.value = false
  }
}

async function onDelete() {
  if (!variant.value) return
  deleting.value = true
  formError.value = null
  try {
    await api.removeVariant(product.value.id, variant.value.id)
    // Se avisa antes de recargar: sin la variante en el detalle, el modal pasaria a "Nueva variante"
    emit('saved', `${label.value} eliminada.`)
    await store.refresh()
  }
  catch (e) {
    formError.value = parseApiError(e, {
      conflict: 'Esta variante ya tiene ventas o movimientos de inventario y no se puede eliminar. Desactívala en su lugar.',
    }).message
    confirmingDelete.value = false
  }
  finally {
    deleting.value = false
  }
}

/** Enter en un input no debe guardar por accidente. */
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && (event.target as HTMLElement).tagName === 'INPUT') event.preventDefault()
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="variant ? `Editar ${label}` : 'Nueva variante'"
    :description="variant ? 'El stock se mueve desde Inventario para que quede en el kárdex.' : 'Una combinación de talla y color que aún no tenga el artículo.'"
  >
    <template #body>
      <form
        id="product-variant-form"
        class="grid gap-5"
        novalidate
        @submit.prevent="onSubmit"
        @keydown="onKeydown"
      >
        <UAlert
          v-if="formError"
          color="error"
          icon="ph:warning-circle"
          :title="formError"
        />

        <div
          v-if="!variant"
          class="grid gap-4 sm:grid-cols-2"
        >
          <UFormField
            label="Talla"
            :error="fieldErrors.sizeId"
          >
            <USelect
              v-model="state.sizeId"
              :items="sizeItems"
              placeholder="Elige una talla"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Color"
            :error="fieldErrors.colorId"
          >
            <USelect
              v-model="state.colorId"
              :items="colorItems"
              placeholder="Elige un color"
              class="w-full"
            >
              <template #item-leading="{ item }">
                <ColorSwatch
                  :hex="item.hex"
                  size="sm"
                />
              </template>
            </USelect>
          </UFormField>
        </div>

        <UFormField
          label="SKU"
          :help="variant ? undefined : 'Si lo dejas vacío se genera al guardar.'"
          :hint="variant ? undefined : 'Opcional'"
          :error="fieldErrors.sku"
        >
          <UInput
            v-model="state.sku"
            :ui="{ base: 'font-mono' }"
            :placeholder="skuPreview ?? 'Automático'"
            autocomplete="off"
            spellcheck="false"
            class="w-full"
          />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField
            label="Ajuste de precio"
            :help="`Precio final: ${formatMoney(finalPrice)}`"
            :error="fieldErrors.priceAdjustment"
          >
            <UInput
              v-model.number="state.priceAdjustment"
              type="number"
              step="0.01"
              inputmode="decimal"
              class="w-full"
            >
              <template #leading>
                <span class="text-muted">$</span>
              </template>
            </UInput>
          </UFormField>
          <UFormField
            label="Costo"
            :error="fieldErrors.costPrice"
          >
            <UInput
              v-model.number="state.costPrice"
              type="number"
              min="0"
              step="0.01"
              inputmode="decimal"
              class="w-full"
            >
              <template #leading>
                <span class="text-muted">$</span>
              </template>
            </UInput>
          </UFormField>
        </div>

        <UFormField
          v-if="!variant"
          label="Stock inicial"
          help="Queda registrado como movimiento de stock inicial."
          :error="fieldErrors.initialStock"
        >
          <UInput
            v-model.number="state.initialStock"
            type="number"
            min="0"
            step="1"
            inputmode="numeric"
            class="w-full"
          />
        </UFormField>

        <USwitch
          v-else
          v-model="state.active"
          label="Activa"
          description="Las inactivas no se pueden comprar en la tienda."
        />

        <div class="grid gap-2">
          <p class="text-sm font-medium text-highlighted">
            Foto propia
          </p>
          <div
            v-if="variant?.overrideImageUrl && !state.image"
            class="flex items-center gap-3"
          >
            <img
              :src="variant.overrideImageUrl"
              :alt="`Foto propia: ${label}`"
              class="aspect-[4/5] w-12 rounded-md border border-default object-cover"
            >
            <VariantImageButton
              id="variant-modal-image"
              v-model="state.image"
              :label="label"
            />
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="ph:x"
              label="Quitar foto propia"
              :loading="removingImage"
              @click="removeImage"
            />
          </div>
          <div
            v-else
            class="flex items-center gap-3"
          >
            <VariantImageButton
              id="variant-modal-image"
              v-model="state.image"
              :label="label"
              :error="fieldErrors.image"
            />
            <p class="text-sm text-muted">
              Opcional. Sin foto propia usa la principal de su color.
            </p>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <template v-if="variant && confirmingDelete">
            <span class="mr-2 text-sm text-muted">¿Eliminar {{ label }}?</span>
            <UButton
              color="error"
              variant="soft"
              size="sm"
              label="Sí, eliminar"
              :loading="deleting"
              @click="onDelete"
            />
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              label="No"
              :disabled="deleting"
              @click="confirmingDelete = false"
            />
          </template>
          <UButton
            v-else-if="variant"
            color="error"
            variant="ghost"
            icon="ph:trash"
            label="Eliminar"
            :disabled="saving"
            @click="confirmingDelete = true"
          />
        </div>
        <div class="flex gap-2">
          <UButton
            color="neutral"
            variant="outline"
            label="Cancelar"
            :disabled="saving || deleting"
            @click="open = false"
          />
          <UButton
            type="submit"
            form="product-variant-form"
            icon="ph:check"
            :loading="saving"
            :disabled="deleting"
            :label="variant ? 'Guardar' : 'Agregar variante'"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
