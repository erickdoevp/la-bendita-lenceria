<script setup lang="ts">
import { useCouponDetail } from '../composables/useCouponDetail'
import { COUPON_ROUTES } from '../constants'
import { useCouponsStore } from '../stores/coupons.store'
import type { Coupon } from '../types'
import { describeCoupon } from '../utils/coupon'
import CouponForm from './CouponForm.vue'
import CouponStatusBadge from './CouponStatusBadge.vue'
import CouponUsagesPanel from './CouponUsagesPanel.vue'

const props = defineProps<{
  couponId: string
  /** Recien creado: se muestra el aviso de exito. */
  created?: boolean
}>()

const store = useCouponsStore()
const { coupon, pending, error, usages, load } = useCouponDetail(props.couponId)

const notice = ref<string | null>(props.created ? 'Cupón creado.' : null)
const actionError = ref<string | null>(null)
const toggling = ref(false)
const deleteOpen = ref(false)
const deleting = ref(false)
const formKey = ref(0)

onMounted(() => {
  load()
  usages.load(0)
})

function onSaved(saved: Coupon) {
  coupon.value = saved
  notice.value = 'Cambios guardados.'
  actionError.value = null
}

function onCancelEdit() {
  // Descarta lo escrito y vuelve a los valores guardados
  formKey.value++
}

async function onToggle() {
  if (!coupon.value) return
  toggling.value = true
  actionError.value = null
  notice.value = null
  try {
    coupon.value = await store.toggle(coupon.value.id)
    notice.value = coupon.value.active ? 'Cupón activado.' : 'Cupón desactivado. Las órdenes ya creadas con él no cambian.'
  }
  catch (e) {
    actionError.value = parseApiError(e).message
  }
  finally {
    toggling.value = false
  }
}

async function onDelete() {
  if (!coupon.value) return
  deleting.value = true
  actionError.value = null
  try {
    await store.remove(coupon.value.id)
    await navigateTo(COUPON_ROUTES.list)
  }
  catch (e) {
    actionError.value = parseApiError(e, {
      conflict: 'Este cupón ya se usó en alguna orden y no se puede eliminar. Desactívalo en su lugar.',
    }).message
    deleteOpen.value = false
  }
  finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="grid gap-8">
    <div class="grid gap-3">
      <NuxtLink
        :to="COUPON_ROUTES.list"
        class="inline-flex items-center gap-1.5 justify-self-start rounded-md text-sm text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
      >
        <Icon
          name="ph:arrow-left"
          class="size-4"
          aria-hidden="true"
        />
        Cupones
      </NuxtLink>

      <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="grid max-w-[65ch] gap-2">
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="font-mono text-2xl font-semibold tracking-wide text-ink md:text-3xl">
              {{ coupon?.code ?? 'Cupón' }}
            </h1>
            <CouponStatusBadge
              v-if="coupon"
              :coupon="coupon"
            />
          </div>
          <p
            v-if="coupon"
            class="leading-relaxed text-ink-muted"
          >
            {{ describeCoupon(coupon) }}
          </p>
        </div>

        <div
          v-if="coupon"
          class="flex flex-wrap gap-2"
        >
          <UiButton
            variant="secondary"
            :icon="coupon.active ? 'ph:pause-circle' : 'ph:play-circle'"
            :loading="toggling"
            @click="onToggle"
          >
            {{ coupon.active ? 'Desactivar' : 'Activar' }}
          </UiButton>
          <!-- Borrar solo si nunca se uso; si no, el backend responde 409 -->
          <UiButton
            v-if="coupon.usedCount === 0"
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
      {{ error.status === 404 ? 'Este cupón no existe.' : error.message }}
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
      v-else-if="pending && !coupon"
      class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
      role="status"
      aria-label="Cargando cupón"
    >
      <UiSkeleton class="h-96 rounded-2xl" />
      <UiSkeleton class="h-56 rounded-2xl" />
    </div>

    <template v-else-if="coupon">
      <UiAlert v-if="actionError">
        {{ actionError }}
      </UiAlert>
      <UiAlert
        v-else-if="notice"
        tone="info"
      >
        {{ notice }}
      </UiAlert>

      <CouponForm
        :key="formKey"
        :coupon="coupon"
        @saved="onSaved"
        @cancel="onCancelEdit"
      />

      <CouponUsagesPanel
        :page="usages.data"
        :pending="usages.pending"
        :error="usages.error"
        @change="usages.load"
        @retry="usages.load()"
      />

      <UiModal
        v-model:open="deleteOpen"
        :title="`Eliminar ${coupon.code}`"
        description="Nadie lo ha usado, así que se puede borrar. No se puede deshacer."
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
