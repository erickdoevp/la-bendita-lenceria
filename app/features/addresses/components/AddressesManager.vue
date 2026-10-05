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
    <UiPageHeader
      title="Direcciones"
      :description="`Tus domicilios de entrega para el checkout. Puedes guardar hasta ${MAX_ADDRESSES}.`"
    >
      <template
        v-if="store.items.length"
        #actions
      >
        <UiButton
          icon="ph:plus"
          :disabled="store.isFull"
          @click="openForm()"
        >
          Agregar dirección
        </UiButton>
      </template>
    </UiPageHeader>

    <UiAlert v-if="actionError || store.error">
      {{ actionError ?? store.error }}
      <button
        v-if="store.error"
        type="button"
        class="ml-1 font-medium underline underline-offset-2"
        @click="store.load()"
      >
        Reintentar
      </button>
    </UiAlert>

    <UiAlert
      v-if="store.isFull"
      tone="info"
    >
      Llegaste al máximo de {{ MAX_ADDRESSES }} direcciones. Elimina una para agregar otra.
    </UiAlert>

    <ul
      v-if="store.pending && !store.loaded"
      class="grid gap-4 sm:grid-cols-2"
    >
      <li
        v-for="n in 2"
        :key="n"
      >
        <UiSkeleton class="h-52 rounded-2xl" />
      </li>
    </ul>

    <UiEmptyState
      v-else-if="store.loaded && !store.items.length"
      icon="ph:map-pin"
      title="Aún no tienes direcciones"
      description="Guarda tu domicilio para que el checkout sea más rápido."
    >
      <UiButton
        icon="ph:plus"
        @click="openForm()"
      >
        Agregar dirección
      </UiButton>
    </UiEmptyState>

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

    <UiModal
      v-model:open="modalOpen"
      :title="editing ? `Editar ${editing.alias}` : 'Nueva dirección'"
    >
      <AddressForm
        :key="editing?.id ?? 'new'"
        :address="editing"
        @saved="modalOpen = false"
        @cancel="modalOpen = false"
      />
    </UiModal>
  </div>
</template>
