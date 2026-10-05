<script setup lang="ts">
import { CUSTOMER_AUTH_ROUTES } from '~/features/customer-auth'
import { STORE_ROUTES } from '~/features/store-catalog'
import { useCheckoutContext } from '../composables/useCheckoutContext'

const { isGuest, coupon, couponPending, couponError, applyCoupon, removeCoupon } = useCheckoutContext()
const uid = useId()
const code = ref('')

async function onApply() {
  if (await applyCoupon(code.value)) code.value = ''
}

const loginTo = { path: CUSTOMER_AUTH_ROUTES.login, query: { redirect: STORE_ROUTES.checkout } }
</script>

<template>
  <!-- El invitado no puede usar cupones (seccion 14.5) -->
  <p
    v-if="isGuest"
    class="text-sm text-ink-muted"
  >
    ¿Tienes un cupón?
    <NuxtLink
      :to="loginTo"
      class="font-medium text-ink underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
    >
      Inicia sesión
    </NuxtLink>
    para usarlo.
  </p>

  <div
    v-else-if="coupon"
    class="flex items-center justify-between gap-3 rounded-lg bg-success-soft px-3.5 py-2.5 text-sm"
  >
    <span class="flex min-w-0 items-center gap-2 text-success">
      <Icon
        name="ph:tag-bold"
        class="size-4 shrink-0"
        aria-hidden="true"
      />
      <span class="min-w-0">
        <span class="font-semibold uppercase tracking-[0.04em]">{{ coupon.code }}</span>
        <span
          v-if="coupon.description"
          class="block truncate text-[13px] text-success/80"
        >{{ coupon.description }}</span>
        <span
          v-else-if="coupon.discountAmount === null"
          class="block text-[13px] text-success/80"
        >Verás el descuento al confirmar.</span>
      </span>
    </span>
    <button
      type="button"
      class="shrink-0 text-[13px] font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-accent"
      @click="removeCoupon"
    >
      Quitar
    </button>
  </div>

  <form
    v-else
    class="grid gap-2"
    novalidate
    @submit.prevent="onApply"
  >
    <label
      :for="`${uid}-coupon`"
      class="sr-only"
    >Código de cupón</label>
    <div class="flex gap-2">
      <UiInput
        :id="`${uid}-coupon`"
        v-model="code"
        :invalid="Boolean(couponError)"
        :aria-describedby="couponError ? `${uid}-coupon-error` : undefined"
        placeholder="Código de cupón"
        autocomplete="off"
        autocapitalize="characters"
        spellcheck="false"
        size="sm"
        class="uppercase placeholder:normal-case"
      />
      <UiButton
        type="submit"
        variant="secondary"
        size="sm"
        class="h-10"
        :loading="couponPending"
        :disabled="!code.trim()"
      >
        Aplicar
      </UiButton>
    </div>
    <p
      v-if="couponError"
      :id="`${uid}-coupon-error`"
      class="text-[13px] text-danger"
      role="alert"
    >
      {{ couponError }}
    </p>
  </form>
</template>
