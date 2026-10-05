<script setup lang="ts">
import { FISCAL_IN_USE_MESSAGE } from '../constants'
import { useFiscalStore } from '../stores/fiscal.store'
import type { FiscalProfile } from '../types'
import FiscalProfileCard from './FiscalProfileCard.vue'
import FiscalProfileForm from './FiscalProfileForm.vue'

const store = useFiscalStore()
const modalOpen = ref(false)
const editing = ref<FiscalProfile | null>(null)
const busy = ref<{ id: string, action: 'default' | 'delete' } | null>(null)
const actionError = ref<string | null>(null)

onMounted(() => store.load())

function openForm(profile: FiscalProfile | null = null) {
  editing.value = profile
  actionError.value = null
  modalOpen.value = true
}

async function run(profile: FiscalProfile, action: 'default' | 'delete') {
  busy.value = { id: profile.id, action }
  actionError.value = null
  try {
    if (action === 'default') await store.setDefault(profile.id)
    else await store.remove(profile.id)
  }
  catch (error) {
    actionError.value = parseApiError(error, { conflict: FISCAL_IN_USE_MESSAGE }).message
  }
  finally {
    busy.value = null
  }
}
</script>

<template>
  <div class="grid gap-6">
    <UPageHeader
      title="Datos fiscales"
      description="Tus RFC para facturar. Los eliges al solicitar la factura de un pedido."
    >
      <template
        v-if="store.items.length"
        #actions
      >
        <UButton
          icon="ph:plus"
          label="Agregar RFC"
          @click="openForm()"
        />
      </template>
    </UPageHeader>

    <UAlert
      v-if="actionError || store.error"
      color="error"
      icon="ph:warning-circle"
      :title="actionError ?? store.error ?? undefined"
      :actions="store.error ? retryAction(() => store.load()) : undefined"
      orientation="horizontal"
    />

    <ul
      v-if="store.pending && !store.loaded"
      class="grid gap-4 sm:grid-cols-2"
    >
      <li
        v-for="n in 2"
        :key="n"
      >
        <USkeleton
          class="h-48 rounded-lg"
        />
      </li>
    </ul>

    <UEmpty
      v-else-if="store.loaded && !store.items.length"
      icon="ph:identification-card"
      title="Aún no tienes datos fiscales"
      description="Agrega tu RFC tal como aparece en tu Constancia de Situación Fiscal para poder pedir facturas."
    >
      <template #actions>
        <UButton
          icon="ph:plus"
          label="Agregar RFC"
          @click="openForm()"
        />
    
      </template>
    </UEmpty>

    <ul
      v-else
      class="grid gap-4 sm:grid-cols-2"
    >
      <li
        v-for="profile in store.sorted"
        :key="profile.id"
      >
        <FiscalProfileCard
          :profile="profile"
          :busy="busy?.id === profile.id ? busy.action : null"
          @edit="openForm(profile)"
          @set-default="run(profile, 'default')"
          @remove="run(profile, 'delete')"
        />
      </li>
    </ul>

    <UModal
      v-model:open="modalOpen"
      :title="editing ? `Editar ${editing.rfc}` : 'Nuevo RFC'"
    >
      <template #body>
        <FiscalProfileForm
          :key="editing?.id ?? 'new'"
          :profile="editing"
          @saved="modalOpen = false"
          @cancel="modalOpen = false"
        />
    
      </template>
    </UModal>
  </div>
</template>
