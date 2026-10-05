<script setup lang="ts">
import { useCheckoutContext } from '../composables/useCheckoutContext'
import type { DeliveryMode } from '../types'
import { deliveryEstimate } from '../utils/checkout-totals'
import CheckoutAddressFields from './CheckoutAddressFields.vue'
import CheckoutAddressPicker from './CheckoutAddressPicker.vue'
import CheckoutOption from './CheckoutOption.vue'
import CheckoutSection from './CheckoutSection.vue'

const form = useCheckoutContext()
const { values, isGuest, fieldErrors } = form
const uid = useId()

const modes: { value: DeliveryMode, label: string, hint: string, icon: string }[] = [
  { value: 'shipping', label: 'Envío a domicilio', hint: 'A todo México', icon: 'ph:truck-bold' },
  { value: 'pickup', label: 'Recoger en tienda', hint: 'Sin costo', icon: 'ph:storefront-bold' },
]

const mode = computed({
  get: () => values.mode as string,
  set: (value: string) => (values.mode = value as DeliveryMode),
})
</script>

<template>
  <CheckoutSection
    id="checkout-delivery"
    :step="2"
    title="Entrega"
  >
    <fieldset class="grid grid-cols-2 gap-3">
      <legend class="sr-only">
        Cómo quieres recibir tu pedido
      </legend>
      <CheckoutOption
        v-for="option in modes"
        :key="option.value"
        v-model="mode"
        name="checkout-mode"
        :value="option.value"
      >
        <span class="flex items-center gap-2 font-medium text-ink">
          <Icon
            :name="option.icon"
            class="size-4 shrink-0 text-ink-muted"
            aria-hidden="true"
          />
          {{ option.label }}
        </span>
        <span class="text-[13px] text-ink-muted">{{ option.hint }}</span>
      </CheckoutOption>
    </fieldset>

    <template v-if="values.mode === 'shipping'">
      <div class="grid gap-4">
        <h3 class="text-sm font-medium text-ink">
          Dirección
        </h3>
        <CheckoutAddressFields v-if="isGuest" />
        <CheckoutAddressPicker v-else />
      </div>

      <div class="grid gap-4">
        <h3 class="text-sm font-medium text-ink">
          Método de envío
        </h3>
        <div
          v-if="form.shippingStatus.value === 'loading' && !form.shippingOptions.value.length"
          class="grid gap-3"
          aria-busy="true"
          aria-label="Cargando métodos de envío"
        >
          <UiSkeleton
            v-for="n in 2"
            :key="n"
            class="h-[68px]"
          />
        </div>
        <div
          v-else-if="form.shippingStatus.value === 'error'"
          class="grid gap-3"
        >
          <UiAlert>No pudimos cargar los métodos de envío.</UiAlert>
          <UiButton
            variant="secondary"
            size="sm"
            class="justify-self-start"
            @click="form.loadShippingOptions()"
          >
            Reintentar
          </UiButton>
        </div>
        <fieldset
          v-else
          class="grid gap-3 transition-opacity"
          :class="form.shippingStatus.value === 'loading' && 'opacity-60'"
          :aria-busy="form.shippingStatus.value === 'loading' || undefined"
        >
          <legend class="sr-only">
            Método de envío
          </legend>
          <CheckoutOption
            v-for="option in form.shippingOptions.value"
            :key="option.id"
            v-model="values.shippingConfigId"
            name="checkout-shipping"
            :value="option.id"
            :invalid="Boolean(fieldErrors.shippingConfigId)"
          >
            <span class="font-medium text-ink">{{ option.name }}</span>
            <span class="text-[13px] text-ink-muted">
              Llega en {{ deliveryEstimate(option.estimatedDaysMin, option.estimatedDaysMax) }}
              <template v-if="!option.free && option.freeFrom"> · Gratis desde {{ formatMoney(option.freeFrom) }}</template>
            </span>
            <template #aside>
              <span
                class="text-sm font-medium tabular-nums"
                :class="option.free ? 'text-success' : 'text-ink'"
              >{{ option.free ? 'Gratis' : formatMoney(option.cost) }}</span>
            </template>
          </CheckoutOption>
        </fieldset>
        <p
          v-if="fieldErrors.shippingConfigId"
          class="text-[13px] text-danger"
          data-checkout-error
          tabindex="-1"
        >
          {{ fieldErrors.shippingConfigId }}
        </p>
      </div>
    </template>

    <div
      v-else
      class="grid gap-4"
    >
      <h3 class="text-sm font-medium text-ink">
        Sucursal
      </h3>
      <div
        v-if="form.locationsStatus.value === 'loading' || form.locationsStatus.value === 'idle'"
        class="grid gap-3"
        aria-busy="true"
        aria-label="Cargando sucursales"
      >
        <UiSkeleton
          v-for="n in 2"
          :key="n"
          class="h-[92px]"
        />
      </div>
      <div
        v-else-if="form.locationsStatus.value === 'error'"
        class="grid gap-3"
      >
        <UiAlert>No pudimos cargar las sucursales.</UiAlert>
        <UiButton
          variant="secondary"
          size="sm"
          class="justify-self-start"
          @click="form.loadLocations()"
        >
          Reintentar
        </UiButton>
      </div>
      <fieldset
        v-else
        class="grid gap-3"
      >
        <legend class="sr-only">
          Sucursal donde recoges
        </legend>
        <CheckoutOption
          v-for="location in form.locations.value"
          :key="location.id"
          v-model="values.pickupLocationId"
          name="checkout-location"
          :value="location.id"
          :invalid="Boolean(fieldErrors.pickupLocationId)"
        >
          <span class="font-medium text-ink">{{ location.name }}</span>
          <span class="text-sm text-ink-muted">{{ location.address }}</span>
          <span
            v-if="location.schedule"
            class="text-[13px] text-ink-muted"
          >{{ location.schedule }}</span>
          <template #aside>
            <span class="text-sm font-medium text-success">Gratis</span>
          </template>
        </CheckoutOption>
      </fieldset>
      <p
        v-if="fieldErrors.pickupLocationId"
        class="text-[13px] text-danger"
        data-checkout-error
        tabindex="-1"
      >
        {{ fieldErrors.pickupLocationId }}
      </p>
      <p class="text-[13px] leading-relaxed text-ink-muted">
        Cuando tu pedido esté listo te daremos un código para recogerlo.
      </p>
    </div>

    <UiField
      :id="`${uid}-notes`"
      v-slot="field"
      :label="values.mode === 'pickup' ? 'Notas para tu pedido' : 'Indicaciones para la entrega'"
      optional
      :error="fieldErrors.notes"
    >
      <UiTextarea
        :id="field.id"
        v-model="values.notes"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        :placeholder="values.mode === 'pickup' ? '' : 'Entre qué calles, color de la fachada, a quién dejarlo…'"
        maxlength="500"
        rows="2"
        class="min-h-0"
      />
    </UiField>
  </CheckoutSection>
</template>
