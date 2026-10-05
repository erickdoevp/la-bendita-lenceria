<script setup lang="ts">
import { ADDRESS_IN_USE_MESSAGE, MAX_ADDRESSES } from '../constants'
import { useAddressesStore } from '../stores/addresses.store'
import type { Address } from '../types'
import AddressCard from './AddressCard.vue'
import AddressForm from './AddressForm.vue'

const store = useAddressesStore()
const modalOpen = ref(false)
const editing = ref<Address | null>(null)
const busy = ref<{ id: string, action: 'default' | 'delete' } | null>(null)
const actionError = ref<string | null>(null)

onMounted(() => store.load())

function openForm(address: Address | null = null) {
  editing.value = address
  actionError.value = null
  modalOpen.value = true
}

async function run(address: Address, action: 'default' | 'delete') {
  busy.value = { id: address.id, action }
  actionError.value = null
  try {
    if (action === 'default') await store.setDefault(address.id)
    else await store.remove(address.id)
  }
  catch (error) {
    actionError.value = parseApiError(error, { conflict: ADDRESS_IN_USE_MESSAGE }).message
  }
  finally {
    busy.value = null
  }
}
</script>

<template>
  <div class="grid gap-6">
    <UPageHeader
      title="Direcciones"
      :description="`Tus domicilios de entrega para el checkout. Puedes guardar hasta ${MAX_ADDRESSES}.`"
    >
      <template
        v-if="store.items.length"
        #actions
      >
        <UButton
          icon="ph:plus"
          :disabled="store.isFull"
          label="Agregar dirección"
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

    <UAlert
      v-if="store.isFull"
      color="primary"
      icon="ph:info"
    >
      <template #title>
        Llegaste al máximo de {{ MAX_ADDRESSES }} direcciones. Elimina una para agregar otra.
    
      </template>
    </UAlert>

    <ul
      v-if="store.pending && !store.loaded"
      class="grid gap-4 sm:grid-cols-2"
    >
      <li
        v-for="n in 2"
        :key="n"
      >
        <USkeleton
          class="h-52 rounded-lg"
        />
      </li>
    </ul>

    <UEmpty
      v-else-if="store.loaded && !store.items.length"
      icon="ph:map-pin"
      title="Aún no tienes direcciones"
      description="Guarda tu domicilio para que el checkout sea más rápido."
    >
      <template #actions>
        <UButton
          icon="ph:plus"
          label="Agregar dirección"
          @click="openForm()"
        />
    
      </template>
    </UEmpty>

    <ul
      v-else
      class="grid gap-4 sm:grid-cols-2"
    >
      <li
        v-for="address in store.sorted"
        :key="address.id"
      >
        <AddressCard
          :address="address"
          :busy="busy?.id === address.id ? busy.action : null"
          @edit="openForm(address)"
          @set-default="run(address, 'default')"
          @remove="run(address, 'delete')"
        />
      </li>
    </ul>

    <UModal
      v-model:open="modalOpen"
      :title="editing ? `Editar ${editing.alias}` : 'Nueva dirección'"
    >
      <template #body>
        <AddressForm
          :key="editing?.id ?? 'new'"
          :address="editing"
          @saved="modalOpen = false"
          @cancel="modalOpen = false"
        />
    
      </template>
    </UModal>
  </div>
</template>
