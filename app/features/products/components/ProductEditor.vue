<script setup lang="ts">
import { useCategoriesStore, useColorsStore, useSizesStore, useTaxesStore } from '~/features/catalog'
import { PRODUCT_ROUTES, STATUS_COLORS, STATUS_LABELS } from '../constants'
import { provideProductForm } from '../composables/useProductForm'
import { useProductEditStore } from '../stores/product-edit.store'
import ProductBasicsSection from './ProductBasicsSection.vue'
import ProductEditImagesSection from './ProductEditImagesSection.vue'
import ProductEditVariantsSection from './ProductEditVariantsSection.vue'
import ProductPricingSection from './ProductPricingSection.vue'
import ProductStatusSection from './ProductStatusSection.vue'

const props = defineProps<{ productId: string }>()

const store = useProductEditStore()
const categories = useCategoriesStore()
const sizes = useSizesStore()
const colors = useColorsStore()
const taxes = useTaxesStore()
provideProductForm('edit', store)

const notice = ref<string | null>(null)
const alert = ref<HTMLElement | null>(null)

const product = computed(() => store.product)
const primaryImage = computed(() => {
  const p = product.value
  if (!p) return null
  return p.images.find(i => i.isPrimary && !i.colorId)?.url
    ?? p.images.find(i => i.isPrimary)?.url
    ?? p.variants.find(v => v.imageUrl)?.imageUrl
    ?? null
})
const stock = computed(() => product.value?.variants.reduce((sum, v) => sum + v.availableStock, 0) ?? 0)
const activeVariants = computed(() => product.value?.variants.filter(v => v.active).length ?? 0)

onMounted(() => {
  store.load(props.productId)
  categories.fetchTree()
  sizes.fetchAll()
  colors.fetchAll()
  taxes.fetchAll()
})

watch(() => store.isDirty, (dirty) => {
  if (dirty) notice.value = null
})

/** Enter en un input no debe guardar por accidente. */
function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (event.key === 'Enter' && target.tagName === 'INPUT') event.preventDefault()
}

async function onSave() {
  notice.value = null
  const ok = await store.save()
  await nextTick()
  if (ok) {
    notice.value = 'Cambios guardados.'
    return
  }
  const firstInvalid = document.querySelector<HTMLElement>('[aria-invalid="true"]')
  const target = firstInvalid ?? alert.value
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  firstInvalid?.focus({ preventScroll: true })
}
</script>

<template>
  <div class="grid gap-8">
    <div class="grid gap-3">
      <UButton
        :to="PRODUCT_ROUTES.list"
        color="neutral"
        variant="link"
        icon="ph:arrow-left"
        label="Artículos"
        class="justify-self-start px-0"
      />

      <UPageHeader :description="product ? `/${product.slug} · Actualizado ${formatDateTime(product.updatedAt)}` : undefined">
        <template #title>
          <span class="flex flex-wrap items-center gap-3">
            {{ product?.name ?? 'Artículo' }}
            <UBadge
              v-if="product"
              :color="STATUS_COLORS[product.status]"
              :label="STATUS_LABELS[product.status]"
            />
          </span>
        </template>
        <template
          v-if="product?.status === 'PUBLISHED'"
          #links
        >
          <UButton
            color="neutral"
            variant="outline"
            icon="ph:arrow-square-out"
            label="Ver en tienda"
            :to="PRODUCT_ROUTES.store(product.slug)"
            target="_blank"
          />
        </template>
      </UPageHeader>
    </div>

    <UAlert
      v-if="store.error"
      color="error"
      icon="ph:warning-circle"
      :title="store.error.status === 404 ? 'Este artículo no existe.' : store.error.message"
      :actions="store.error.status !== 404 ? retryAction(() => store.load(productId)) : undefined"
      orientation="horizontal"
    />

    <div
      v-else-if="store.pending || !product"
      class="grid gap-6"
      role="status"
      aria-label="Cargando artículo"
    >
      <USkeleton class="h-40 rounded-lg" />
      <USkeleton class="h-96 rounded-lg" />
      <USkeleton class="h-64 rounded-lg" />
    </div>

    <template v-else>
      <UCard>
        <div class="grid gap-6 sm:grid-cols-[6rem_minmax(0,1fr)] sm:items-center">
          <div class="aspect-[4/5] w-24 overflow-hidden rounded-lg border border-default bg-muted">
            <img
              v-if="primaryImage"
              :src="primaryImage"
              :alt="product.name"
              class="size-full object-cover"
            >
            <div
              v-else
              class="grid size-full place-items-center text-muted"
            >
              <UIcon
                name="ph:image"
                class="size-6"
                aria-hidden="true"
              />
            </div>
          </div>
          <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm lg:grid-cols-4">
            <div class="grid gap-0.5">
              <dt class="text-muted">
                Categoría
              </dt>
              <dd class="text-highlighted">
                {{ product.category?.name ?? 'Sin categoría' }}
              </dd>
            </div>
            <div class="grid gap-0.5">
              <dt class="text-muted">
                Variantes activas
              </dt>
              <dd class="tabular-nums text-highlighted">
                {{ activeVariants }} de {{ product.variants.length }}
              </dd>
            </div>
            <div class="grid gap-0.5">
              <dt class="text-muted">
                Stock disponible
              </dt>
              <dd
                class="tabular-nums"
                :class="stock ? 'text-highlighted' : 'font-medium text-error'"
              >
                {{ stock }} {{ stock === 1 ? 'pieza' : 'piezas' }}
              </dd>
            </div>
            <div class="grid gap-0.5">
              <dt class="text-muted">
                Reseñas
              </dt>
              <dd class="tabular-nums text-highlighted">
                <template v-if="product.reviewCount">
                  {{ product.averageRating?.toFixed(1) }} ★ · {{ product.reviewCount }}
                </template>
                <span
                  v-else
                  class="text-muted"
                >Sin reseñas</span>
              </dd>
            </div>
          </dl>
        </div>
      </UCard>

      <form
        class="grid gap-6"
        novalidate
        @submit.prevent="onSave"
        @keydown="onKeydown"
      >
        <div
          v-if="store.formError"
          ref="alert"
        >
          <UAlert
            color="error"
            icon="ph:warning-circle"
            :title="store.formError"
          />
        </div>
        <UAlert
          v-else-if="notice"
          color="primary"
          icon="ph:check-circle"
          :title="notice"
        />

        <ProductBasicsSection />
        <ProductPricingSection />
        <ProductStatusSection />

        <!-- Solo con cambios: variantes e imagenes se guardan al momento y no pasan por aqui -->
        <div
          v-if="store.isDirty"
          class="sticky bottom-4 z-10 flex flex-col gap-3 rounded-lg border border-default bg-default/95 p-3 pl-5 shadow-[0_12px_40px_-12px_rgb(24_24_27/0.25)] backdrop-blur sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="text-sm text-muted">
            Tienes cambios sin guardar en los datos del artículo.
          </p>
          <div class="flex items-center justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              label="Descartar"
              :disabled="store.saving"
              @click="store.discard()"
            />
            <UButton
              type="submit"
              icon="ph:check"
              :loading="store.saving"
              :label="store.saving ? 'Guardando' : 'Guardar cambios'"
            />
          </div>
        </div>
      </form>

      <ProductEditVariantsSection />
      <ProductEditImagesSection />
    </template>
  </div>
</template>
