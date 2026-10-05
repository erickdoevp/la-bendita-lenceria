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
      <UButton
        :to="COUPON_ROUTES.list"
        color="neutral"
        variant="link"
        icon="ph:arrow-left"
        label="Cupones"
        class="justify-self-start px-0"
      />

      <UPageHeader :description="coupon ? describeCoupon(coupon) : undefined">
        <template #title>
          <span class="flex flex-wrap items-center gap-3">
            <span class="font-mono tracking-wide">{{ coupon?.code ?? 'Cupón' }}</span>
            <CouponStatusBadge
              v-if="coupon"
              :coupon="coupon"
            />
          </span>
        </template>

        <template
          v-if="coupon"
          #links
        >
          <UButton
            color="neutral"
            variant="outline"
            :icon="coupon.active ? 'ph:pause-circle' : 'ph:play-circle'"
            :label="coupon.active ? 'Desactivar' : 'Activar'"
            :loading="toggling"
            @click="onToggle"
          />
          <!-- Borrar solo si nunca se uso; si no, el backend responde 409 -->
          <UButton
            v-if="coupon.usedCount === 0"
            color="error"
            variant="soft"
            icon="ph:trash"
            label="Eliminar"
            :disabled="toggling"
            @click="deleteOpen = true"
          />
        </template>
      </UPageHeader>
    </div>

    <UAlert
      v-if="error"
      color="error"
      icon="ph:warning-circle"
      :title="error.status === 404 ? 'Este cupón no existe.' : error.message"
      :actions="error.status !== 404 ? retryAction(load) : undefined"
      orientation="horizontal"
    />

    <div
      v-else-if="pending && !coupon"
      class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
      role="status"
      aria-label="Cargando cupón"
    >
      <USkeleton class="h-96 rounded-lg" />
      <USkeleton class="h-56 rounded-lg" />
    </div>

    <template v-else-if="coupon">
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

      <UModal
        v-model:open="deleteOpen"
        :title="`Eliminar ${coupon.code}`"
        description="Nadie lo ha usado, así que se puede borrar. No se puede deshacer."
      >
        <template #footer>
          <div class="flex w-full flex-wrap justify-end gap-2">
            <UButton
              color="neutral"
              variant="outline"
              label="Cancelar"
              :disabled="deleting"
              @click="deleteOpen = false"
            />
            <UButton
              color="error"
              icon="ph:trash"
              label="Sí, eliminar"
              :loading="deleting"
              @click="onDelete"
            />
          </div>
        </template>
      </UModal>
    </template>
  </div>
</template>
