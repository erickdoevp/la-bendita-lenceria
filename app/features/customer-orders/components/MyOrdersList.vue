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
    <UPageHeader
      title="Mis pedidos"
      description="Revisa el estado de tus compras, paga lo pendiente o solicita tu factura."
    />

    <UAlert
      v-if="list.error"
      color="error"
      icon="ph:warning-circle"
      :title="list.error"
      :actions="retryAction(() => list.load())"
      orientation="horizontal"
    />

    <div
      v-if="list.pending && !page"
      class="grid gap-3"
    >
      <USkeleton
        v-for="n in 3"
        :key="n"
        class="h-36 rounded-lg"
      />
    </div>

    <UEmpty
      v-else-if="page && !items.length"
      icon="ph:package"
      title="Aún no tienes pedidos"
      description="Cuando compres algo, aquí podrás seguir tu pedido."
    >
      <template #actions>
        <UButton
          color="neutral"
          variant="outline"
          to="/"
          icon="ph:storefront"
          label="Ir a la tienda"
        />
    
      </template>
    </UEmpty>

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

    <PagePagination
      v-if="page"
      :page="page"
      :disabled="list.pending"
      @change="list.load"
    />
  </div>
</template>
