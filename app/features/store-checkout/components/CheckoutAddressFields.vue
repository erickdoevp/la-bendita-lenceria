<script setup lang="ts">
import { useCheckoutContext } from '../composables/useCheckoutContext'

const { values, fieldErrors } = useCheckoutContext()
const uid = useId()
const address = values.address
const error = (field: keyof typeof address) => fieldErrors.value[`address.${field}`]
</script>

<template>
  <!-- Sin cuenta no hay libreta: la direccion va en linea dentro del pedido -->
  <fieldset class="grid gap-5">
    <legend class="sr-only">
      Dirección de entrega
    </legend>

    <div class="grid gap-5 sm:grid-cols-[minmax(0,1fr)_10rem] sm:gap-4">
      <UiField
        :id="`${uid}-street`"
        v-slot="field"
        label="Calle"
        :error="error('street')"
      >
        <UiInput
          :id="field.id"
          v-model="address.street"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          autocomplete="address-line1"
        />
      </UiField>
      <UiField
        :id="`${uid}-cp`"
        v-slot="field"
        label="Código postal"
        :error="error('cp')"
      >
        <UiInput
          :id="field.id"
          v-model="address.cp"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          inputmode="numeric"
          autocomplete="postal-code"
          maxlength="5"
        />
      </UiField>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <UiField
        :id="`${uid}-ext`"
        v-slot="field"
        label="Número exterior"
        :error="error('exteriorNumber')"
      >
        <UiInput
          :id="field.id"
          v-model="address.exteriorNumber"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
        />
      </UiField>
      <UiField
        :id="`${uid}-int`"
        v-slot="field"
        label="Interior"
        optional
        :error="error('interiorNumber')"
      >
        <UiInput
          :id="field.id"
          v-model="address.interiorNumber"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          autocomplete="address-line2"
        />
      </UiField>
    </div>

    <UiField
      :id="`${uid}-colonia`"
      v-slot="field"
      label="Colonia"
      :error="error('colonia')"
    >
      <UiInput
        :id="field.id"
        v-model="address.colonia"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        autocomplete="address-level3"
      />
    </UiField>

    <div class="grid gap-5 sm:grid-cols-2 sm:gap-4">
      <UiField
        :id="`${uid}-municipio`"
        v-slot="field"
        label="Municipio o alcaldía"
        :error="error('municipio')"
      >
        <UiInput
          :id="field.id"
          v-model="address.municipio"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          autocomplete="address-level2"
        />
      </UiField>
      <UiField
        :id="`${uid}-estado`"
        v-slot="field"
        label="Estado"
        :error="error('estado')"
      >
        <UiInput
          :id="field.id"
          v-model="address.estado"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          autocomplete="address-level1"
        />
      </UiField>
    </div>

    <UiSwitch
      :id="`${uid}-other`"
      v-model="values.otherRecipient"
      label="Lo recibe otra persona"
      description="Si es un regalo o no estarás en casa."
    />

    <div
      v-if="values.otherRecipient"
      class="grid gap-5 sm:grid-cols-[3fr_2fr] sm:gap-4"
    >
      <UiField
        :id="`${uid}-recipient`"
        v-slot="field"
        label="Quién recibe"
        :error="error('recipientName')"
      >
        <UiInput
          :id="field.id"
          v-model="address.recipientName"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
        />
      </UiField>
      <UiField
        :id="`${uid}-recipient-phone`"
        v-slot="field"
        label="Su teléfono"
        :error="error('phone')"
      >
        <UiInput
          :id="field.id"
          v-model="address.phone"
          :invalid="field.invalid"
          :aria-describedby="field.describedBy"
          type="tel"
          inputmode="tel"
          maxlength="10"
        />
      </UiField>
    </div>
  </fieldset>
</template>
