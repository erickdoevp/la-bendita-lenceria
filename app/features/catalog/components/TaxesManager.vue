<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useTaxesStore } from '../stores/taxes.store'
import type { TaxConfig } from '../types'
import { useEditModal } from '../utils/edit-modal'
import CatalogRowActions from './CatalogRowActions.vue'
import CatalogTableSkeleton from './CatalogTableSkeleton.vue'
import TaxForm from './TaxForm.vue'

const store = useTaxesStore()
const { editing, open: editOpen } = useEditModal<TaxConfig>()
const activatingId = ref<string | null>(null)
const actionError = ref<string | null>(null)

const percent = (rate: number) => `${Number((rate * 100).toFixed(2))} %`

const columns: TableColumn<TaxConfig>[] = [
  { accessorKey: 'name', header: 'Nombre' },
  { accessorKey: 'rate', header: 'Tasa' },
  { accessorKey: 'active', header: 'Estado', meta: { class: { th: 'text-right', td: 'text-right py-2' } } },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, 'Acciones'), meta: { class: { td: 'w-px py-2' } } },
]

onMounted(() => store.fetchAll())

async function onActivate(tax: TaxConfig) {
  activatingId.value = tax.id
  actionError.value = null
  try {
    await store.activate(tax.id)
  }
  catch (error) {
    actionError.value = parseApiError(error).message
  }
  finally {
    activatingId.value = null
  }
}
</script>

<template>
  <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
    <UCard
      title="Impuestos"
      description="El IVA activo se aplica a los artículos que no tienen uno propio."
    >
      <div class="grid gap-5">
        <UAlert
          v-if="actionError || store.error"
          color="error"
          icon="ph:warning-circle"
          :title="actionError ?? store.error ?? undefined"
          :actions="store.error ? retryAction(() => store.fetchAll(true)) : undefined"
          orientation="horizontal"
        />

        <CatalogTableSkeleton
          v-if="store.status === 'pending'"
          :rows="2"
        />

        <UEmpty
          v-else-if="store.status === 'ready' && !store.items.length"
          icon="ph:percent"
          title="Aún no hay impuestos"
          description="Crea al menos un IVA y márcalo como global."
        />

        <UTable
          v-else-if="store.items.length"
          :data="store.items"
          :columns="columns"
          class="-mx-4 sm:-mx-6"
        >
          <template #name-cell="{ row }">
            <span class="font-medium text-highlighted">{{ row.original.name }}</span>
          </template>
          <template #rate-cell="{ row }">
            <span class="tabular-nums">{{ percent(row.original.rate) }}</span>
          </template>
          <template #active-cell="{ row }">
            <UBadge
              v-if="row.original.active"
              icon="ph:check-circle-fill"
              label="IVA global"
            />
            <UButton
              v-else
              color="neutral"
              variant="outline"
              size="sm"
              label="Activar"
              :loading="activatingId === row.original.id"
              :disabled="Boolean(activatingId)"
              @click="onActivate(row.original)"
            />
          </template>
          <template #actions-cell="{ row }">
            <CatalogRowActions
              :name="row.original.name"
              :deletable="false"
              @edit="editing = row.original"
            />
          </template>
        </UTable>
      </div>
    </UCard>

    <UCard
      class="lg:sticky lg:top-6"
      title="Nuevo impuesto"
    >
      <TaxForm />
    </UCard>

    <UModal
      v-model:open="editOpen"
      :title="`Editar ${editing?.name ?? 'impuesto'}`"
    >
      <template #body>
        <TaxForm
          :tax="editing"
          @saved="editing = null"
          @cancel="editing = null"
        />
    
      </template>
    </UModal>
  </div>
</template>
