<script setup lang="ts">
import { useMyOrdersStore } from '../stores/my-orders.store'
import MyOrderCard from './MyOrderCard.vue'

const store = useMyOrdersStore()
const list = store.list

const page = computed(() => list.data)
const items = computed(() => page.value?.items ?? [])

onMounted(() => list.load(page.value?.page ?? 0))
</script>

<template>
  <div class="grid gap-6">
    <UiPageHeader
      title="Mis pedidos"
      description="Revisa el estado de tus compras, paga lo pendiente o solicita tu factura."
    />

    <UiAlert v-if="list.error">
      {{ list.error }}
      <button
        type="button"
        class="ml-1 font-medium underline underline-offset-2"
        @click="list.load()"
      >
        Reintentar
      </button>
    </UiAlert>

    <div
      v-if="list.pending && !page"
      class="grid gap-3"
    >
      <UiSkeleton
        v-for="n in 3"
        :key="n"
        class="h-36 rounded-2xl"
      />
    </div>

    <UiEmptyState
      v-else-if="page && !items.length"
      icon="ph:package"
      title="Aún no tienes pedidos"
      description="Cuando compres algo, aquí podrás seguir tu pedido."
    >
      <UiButton
        to="/"
        variant="secondary"
        icon="ph:storefront"
      >
        Ir a la tienda
      </UiButton>
    </UiEmptyState>

    <ul
      v-else
      class="grid gap-3 transition-opacity"
      :class="list.pending && 'opacity-60'"
    >
      <li
        v-for="order in items"
        :key="order.id"
      >
        <MyOrderCard :order="order" />
      </li>
    </ul>

    <UiPagination
      v-if="page"
      :page="page.page"
      :total-pages="page.totalPages"
      :total-elements="page.totalElements"
      :disabled="list.pending"
      @change="list.load"
    />
  </div>
</template>
