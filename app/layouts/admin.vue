<script setup lang="ts">
import { ADMIN_NAV, AdminSidebar } from '~/features/admin-shell'

const route = useRoute()

// Titulo de la barra superior: la seccion activa del menu
const sectionTitle = computed(() => {
  const items = ADMIN_NAV.flatMap(group => group.items)
  const match = items
    .filter(item => (item.exact ? route.path === item.to : route.path.startsWith(item.to)))
    .sort((a, b) => b.to.length - a.to.length)[0]
  return match?.label ?? 'Panel'
})
</script>

<template>
  <UDashboardGroup>
    <AdminSidebar />

    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar :title="sectionTitle" />
      </template>

      <template #body>
        <div class="mx-auto w-full max-w-6xl">
          <slot />
        </div>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
