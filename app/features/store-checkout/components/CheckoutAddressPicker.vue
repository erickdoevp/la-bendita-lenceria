<script setup lang="ts">
import { AddressForm } from '~/features/addresses'
import type { Address } from '~/features/addresses'
import { useCheckoutContext } from '../composables/useCheckoutContext'
import CheckoutOption from './CheckoutOption.vue'

const { values, addresses, fieldErrors } = useCheckoutContext()
const adding = ref(false)

function onSaved(address: Address) {
  values.addressId = address.id
  adding.value = false
}

const line = (a: Address) => `${a.street} ${a.exteriorNumber}${a.interiorNumber ? ` int. ${a.interiorNumber}` : ''}, ${a.colonia}`
const city = (a: Address) => `${a.cp} ${a.municipio}, ${a.estado}`
</script>

<template>
  <div class="grid gap-3">
    <div
      v-if="!addresses.loaded && addresses.pending"
      class="grid gap-3"
      aria-busy="true"
      aria-label="Cargando tus direcciones"
    >
      <UiSkeleton
        v-for="n in 2"
        :key="n"
        class="h-[88px]"
      />
    </div>

    <div
      v-else-if="addresses.error && !addresses.loaded"
      class="grid gap-3"
    >
      <UiAlert>{{ addresses.error }}</UiAlert>
      <UiButton
        variant="secondary"
        size="sm"
        class="justify-self-start"
        @click="addresses.load()"
      >
        Reintentar
      </UiButton>
    </div>

    <template v-else>
      <fieldset
        v-if="addresses.sorted.length"
        class="grid gap-3"
      >
        <legend class="sr-only">
          Dirección de entrega
        </legend>
        <CheckoutOption
          v-for="address in addresses.sorted"
          :key="address.id"
          v-model="values.addressId"
          name="checkout-address"
          :value="address.id"
          :invalid="Boolean(fieldErrors.addressId)"
        >
          <span class="flex items-center gap-2 font-medium text-ink">
            {{ address.alias }}
            <span
              v-if="address.isDefault"
              class="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted"
            >Predeterminada</span>
          </span>
          <span class="text-sm text-ink-muted">{{ address.recipientName }} · {{ address.phone }}</span>
          <span class="text-sm text-ink-muted">{{ line(address) }}</span>
          <span class="text-sm text-ink-muted">{{ city(address) }}</span>
        </CheckoutOption>
      </fieldset>

      <p
        v-if="fieldErrors.addressId"
        class="text-[13px] text-danger"
        data-checkout-error
        tabindex="-1"
      >
        {{ fieldErrors.addressId }}
      </p>

      <div
        v-if="adding || !addresses.sorted.length"
        class="rounded-xl border border-line bg-surface-raised p-5"
      >
        <p class="mb-5 font-medium text-ink">
          {{ addresses.sorted.length ? 'Nueva dirección' : 'Agrega tu dirección de entrega' }}
        </p>
        <!-- Se guarda en tu cuenta para la proxima compra -->
        <AddressForm
          @saved="onSaved"
          @cancel="adding = false"
        />
      </div>

      <button
        v-else-if="!addresses.isFull"
        type="button"
        class="inline-flex items-center gap-2 justify-self-start rounded-lg py-1 text-sm font-medium text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-accent"
        @click="adding = true"
      >
        <Icon
          name="ph:plus-bold"
          class="size-3.5"
          aria-hidden="true"
        />
        Agregar otra dirección
      </button>
    </template>
  </div>
</template>
