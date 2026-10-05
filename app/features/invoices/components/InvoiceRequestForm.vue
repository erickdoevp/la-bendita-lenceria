<script setup lang="ts">
import { FiscalProfileForm, regimenLabel, useFiscalStore } from '~/features/fiscal-data'
import type { FiscalProfile } from '~/features/fiscal-data'
import { DEFAULT_USO_CFDI, USO_CFDI_OPTIONS } from '../constants'
import { useInvoicesApi } from '../services'
import type { Invoice } from '../types'

const props = defineProps<{ orderId: string }>()
const emit = defineEmits<{ requested: [invoice: Invoice], cancel: [] }>()

const api = useInvoicesApi()
const fiscal = useFiscalStore()
const uid = useId()

const values = reactive({ fiscalDataId: '', usoCFDI: DEFAULT_USO_CFDI })
const pending = ref(false)
const formError = ref<string | null>(null)
const addingProfile = ref(false)

const selected = computed(() => fiscal.items.find(p => p.id === values.fiscalDataId) ?? null)

onMounted(async () => {
  await fiscal.ensureLoaded()
  values.fiscalDataId ||= fiscal.defaultProfile?.id ?? fiscal.sorted[0]?.id ?? ''
  addingProfile.value = fiscal.loaded && !fiscal.items.length
})

function onProfileSaved(profile: FiscalProfile) {
  values.fiscalDataId = profile.id
  addingProfile.value = false
}

async function onSubmit() {
  formError.value = null
  if (!values.fiscalDataId) {
    formError.value = 'Elige los datos fiscales para la factura.'
    return
  }

  pending.value = true
  try {
    emit('requested', await api.request({ orderId: props.orderId, ...values }))
  }
  catch (error) {
    // 422: orden sin pagar o con factura vigente; 403/404: datos ajenos o inexistentes
    formError.value = parseApiError(error).message
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <div
    v-if="!fiscal.loaded && fiscal.pending"
    class="grid gap-3"
  >
    <UiSkeleton class="h-11" />
    <UiSkeleton class="h-11" />
  </div>

  <UiAlert v-else-if="fiscal.error">
    {{ fiscal.error }}
  </UiAlert>

  <div
    v-else-if="addingProfile"
    class="grid gap-4"
  >
    <p class="text-sm text-ink-muted">
      {{ fiscal.items.length ? 'Agrega otro RFC para esta factura.' : 'Para facturar necesitamos tus datos fiscales. Se guardan en tu cuenta para la próxima vez.' }}
    </p>
    <FiscalProfileForm
      @saved="onProfileSaved"
      @cancel="fiscal.items.length ? (addingProfile = false) : emit('cancel')"
    />
  </div>

  <form
    v-else
    class="grid gap-5"
    novalidate
    @submit.prevent="onSubmit"
  >
    <UiAlert v-if="formError">
      {{ formError }}
    </UiAlert>

    <UiField
      :id="`${uid}-fiscal`"
      v-slot="field"
      label="Datos fiscales"
      :hint="selected ? regimenLabel(selected.regimenFiscal) : undefined"
    >
      <UiSelect
        :id="field.id"
        v-model="values.fiscalDataId"
        :aria-describedby="field.describedBy"
      >
        <option
          v-for="profile in fiscal.sorted"
          :key="profile.id"
          :value="profile.id"
        >
          {{ profile.rfc }} · {{ profile.razonSocial }}
        </option>
      </UiSelect>
    </UiField>
    <button
      type="button"
      class="-mt-3 justify-self-start text-[13px] text-accent underline-offset-2 hover:underline"
      @click="addingProfile = true"
    >
      Usar otro RFC
    </button>

    <UiField
      :id="`${uid}-uso`"
      v-slot="field"
      label="Uso del CFDI"
      hint="Si no sabes cuál elegir, «Gastos en general» es el más común."
    >
      <UiSelect
        :id="field.id"
        v-model="values.usoCFDI"
        :aria-describedby="field.describedBy"
      >
        <option
          v-for="uso in USO_CFDI_OPTIONS"
          :key="uso.value"
          :value="uso.value"
        >
          {{ uso.value }} · {{ uso.label }}
        </option>
      </UiSelect>
    </UiField>

    <div class="flex flex-wrap gap-2">
      <UiButton
        type="submit"
        :loading="pending"
      >
        Solicitar factura
      </UiButton>
      <UiButton
        variant="secondary"
        :disabled="pending"
        @click="emit('cancel')"
      >
        Cancelar
      </UiButton>
    </div>
  </form>
</template>
