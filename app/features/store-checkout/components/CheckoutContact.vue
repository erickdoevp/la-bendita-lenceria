<script setup lang="ts">
import { CUSTOMER_AUTH_ROUTES, useCustomerAuthStore } from '~/features/customer-auth'
import { STORE_ROUTES } from '~/features/store-catalog'
import { useCheckoutContext } from '../composables/useCheckoutContext'
import CheckoutSection from './CheckoutSection.vue'

const { values, isGuest, fieldErrors } = useCheckoutContext()
const auth = useCustomerAuthStore()
const uid = useId()

const loginTo = { path: CUSTOMER_AUTH_ROUTES.login, query: { redirect: STORE_ROUTES.checkout } }
</script>

<template>
  <CheckoutSection
    id="checkout-contact"
    :step="1"
    title="Contacto"
    :description="isGuest ? 'Para darte seguimiento y avisarte cualquier cambio en tu pedido.' : undefined"
  >
    <template
      v-if="isGuest"
      #action
    >
      <p class="text-sm text-ink-muted">
        ¿Ya tienes cuenta?
        <NuxtLink
          :to="loginTo"
          class="font-medium text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
        >
          Inicia sesión
        </NuxtLink>
      </p>
    </template>

    <div
      v-if="!isGuest && auth.user"
      class="flex items-center gap-3.5 rounded-xl border border-line bg-surface-raised px-4 py-3.5"
    >
      <span
        class="grid size-10 shrink-0 place-items-center rounded-full bg-accent/10 text-sm font-semibold text-accent"
        aria-hidden="true"
      >{{ auth.user.name.charAt(0) }}</span>
      <div class="min-w-0">
        <p class="truncate font-medium text-ink">
          {{ auth.user.displayName }}
        </p>
        <p class="truncate text-sm text-ink-muted">
          {{ auth.user.email }}
        </p>
      </div>
    </div>

    <div
      v-else
      class="grid gap-5"
    >
      <UiField
        :id="`${uid}-email`"
        v-slot="field"
        label="Correo electrónico"
        :error="fieldErrors.email"
      >
        <UiInput
          :id="field.id"
          v-model="values.email"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          type="email"
          inputmode="email"
          autocomplete="email"
          spellcheck="false"
        />
      </UiField>
      <div class="grid gap-5 sm:grid-cols-[3fr_2fr] sm:gap-4">
        <UiField
          :id="`${uid}-name`"
          v-slot="field"
          label="Nombre completo"
          :error="fieldErrors.name"
        >
          <UiInput
            :id="field.id"
            v-model="values.name"
            :invalid="field.invalid"
            :aria-describedby="field.describedBy"
            autocomplete="name"
          />
        </UiField>
        <UiField
          :id="`${uid}-phone`"
          v-slot="field"
          label="Teléfono"
          hint="10 dígitos."
          :error="fieldErrors.phone"
        >
          <UiInput
            :id="field.id"
            v-model="values.phone"
            :invalid="field.invalid"
            :aria-describedby="field.describedBy"
            type="tel"
            inputmode="tel"
            autocomplete="tel-national"
            maxlength="10"
          />
        </UiField>
      </div>
      <p class="flex items-start gap-2 text-[13px] leading-relaxed text-ink-muted">
        <Icon
          name="ph:info-bold"
          class="mt-0.5 size-3.5 shrink-0"
          aria-hidden="true"
        />
        Sin cuenta pagas solo con tarjeta. Con cuenta puedes usar cupones, pedir factura y seguir tus pedidos.
      </p>
    </div>
  </CheckoutSection>
</template>
