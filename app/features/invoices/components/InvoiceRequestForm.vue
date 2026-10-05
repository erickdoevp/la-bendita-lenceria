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
    <USkeleton
      class="h-11"
    />
    <USkeleton
      class="h-11"
    />
  </div>

  <UAlert
    v-else-if="fiscal.error"
    color="error"
    icon="ph:warning-circle"
    :title="fiscal.error"
  />

  <div
    v-else-if="addingProfile"
    class="grid gap-4"
  >
    <p class="text-sm text-muted">
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
    <UAlert
      v-if="formError"
      color="error"
      icon="ph:warning-circle"
      :title="formError"
    />

    <UFormField
      label="Datos fiscales"
      :help="selected ? regimenLabel(selected.regimenFiscal) : undefined"
    >
      <USelect
        v-model="values.fiscalDataId"
        :items="fiscal.sorted.map(profile => ({ label: `${profile.rfc} · ${profile.razonSocial}`, value: profile.id }))"
      />
    </UFormField>
    <UButton
      variant="link"
      size="sm"
      label="Usar otro RFC"
      class="-mt-3 justify-self-start px-0"
      @click="addingProfile = true"
    />

    <UFormField
      label="Uso del CFDI"
      help="Si no sabes cuál elegir, «Gastos en general» es el más común."
    >
      <USelect
        v-model="values.usoCFDI"
        :items="USO_CFDI_OPTIONS.map(uso => ({ label: `${uso.value} · ${uso.label}`, value: uso.value }))"
      />
    </UFormField>

    <div class="flex flex-wrap gap-2">
      <UButton
        type="submit"
        :loading="pending"
        label="Solicitar factura"
      />
      <UButton
        color="neutral"
        variant="outline"
        :disabled="pending"
        label="Cancelar"
        @click="emit('cancel')"
      />
    </div>
  </form>
</template>
