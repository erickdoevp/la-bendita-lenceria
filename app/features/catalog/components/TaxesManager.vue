<script setup lang="ts">
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
    <UiPanel
      title="Impuestos"
      description="El IVA activo se aplica a los artículos que no tienen uno propio."
    >
      <div class="grid gap-5">
        <UiAlert v-if="actionError || store.error">
          {{ actionError ?? store.error }}
          <button
            v-if="store.error"
            type="button"
            class="ml-1 font-medium underline underline-offset-2"
            @click="store.fetchAll(true)"
          >
            Reintentar
          </button>
        </UiAlert>

        <CatalogTableSkeleton
          v-if="store.status === 'pending'"
          :rows="2"
        />

        <UiEmptyState
          v-else-if="store.status === 'ready' && !store.items.length"
          icon="ph:percent"
          title="Aún no hay impuestos"
          description="Crea al menos un IVA y márcalo como global."
        />

        <div
          v-else-if="store.items.length"
          class="-mx-5 overflow-x-auto sm:-mx-6"
        >
          <table class="w-full text-left text-sm">
            <thead class="text-ink-muted">
              <tr>
                <th class="px-5 pb-3 font-medium sm:px-6">
                  Nombre
                </th>
                <th class="pb-3 font-medium">
                  Tasa
                </th>
                <th class="pb-3 text-right font-medium">
                  Estado
                </th>
                <th class="px-5 pb-3 sm:px-6">
                  <span class="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line border-t border-line">
              <tr
                v-for="tax in store.items"
                :key="tax.id"
              >
                <td class="px-5 py-3 font-medium text-ink sm:px-6">
                  {{ tax.name }}
                </td>
                <td class="py-3 tabular-nums text-ink-muted">
                  {{ percent(tax.rate) }}
                </td>
                <td class="py-2 text-right">
                  <span
                    v-if="tax.active"
                    class="inline-flex h-9 items-center gap-1.5 text-sm font-medium text-accent"
                  >
                    <Icon
                      name="ph:check-circle-fill"
                      class="size-4"
                      aria-hidden="true"
                    />
                    IVA global
                  </span>
                  <UiButton
                    v-else
                    variant="secondary"
                    size="sm"
                    :loading="activatingId === tax.id"
                    :disabled="Boolean(activatingId)"
                    @click="onActivate(tax)"
                  >
                    Activar
                  </UiButton>
                </td>
                <td class="w-px px-5 py-2 sm:px-6">
                  <CatalogRowActions
                    :name="tax.name"
                    :deletable="false"
                    @edit="editing = tax"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </UiPanel>

    <UiPanel
      class="lg:sticky lg:top-6"
      title="Nuevo impuesto"
    >
      <TaxForm />
    </UiPanel>

    <UiModal
      v-model:open="editOpen"
      :title="`Editar ${editing?.name ?? 'impuesto'}`"
    >
      <TaxForm
        :tax="editing"
        @saved="editing = null"
        @cancel="editing = null"
      />
    </UiModal>
  </div>
</template>
