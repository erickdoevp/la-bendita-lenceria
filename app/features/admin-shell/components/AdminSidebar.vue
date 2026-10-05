<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { AdminLogoutButton, useAuthStore } from '~/features/auth'
import { PRODUCT_ROUTES, useProductDraftStore } from '~/features/products'
import { REVIEW_ROUTES, useReviewsStore } from '~/features/reviews'
import { ADMIN_NAV } from '../constants'
import type { AdminNavItem } from '../constants'

const route = useRoute()
const auth = useAuthStore()
const draft = useProductDraftStore()
const reviews = useReviewsStore()

onMounted(() => {
  if (!reviews.pending.data && !reviews.pending.pending) void reviews.pending.load(0)
})

// Activo tambien en subrutas (/admin/coupons/:id), salvo los marcados como exactos
function isActive(item: AdminNavItem) {
  return item.exact ? route.path === item.to : route.path.startsWith(item.to)
}

function badgeFor(item: AdminNavItem): NavigationMenuItem['badge'] {
  if (item.to === PRODUCT_ROUTES.create && draft.isDirty && !draft.created) {
    return { label: 'Borrador', color: 'primary', variant: 'soft' }
  }
  if (item.to === REVIEW_ROUTES.moderation && reviews.pendingCount) {
    return { label: String(reviews.pendingCount), color: 'primary', variant: 'solid' }
  }
  return undefined
}

// Un grupo por seccion; la etiqueta del grupo es un item de tipo "label"
const items = computed<NavigationMenuItem[][]>(() => ADMIN_NAV.map(group => [
  ...(group.label ? [{ label: group.label, type: 'label' as const }] : []),
  ...group.items.map(item => ({
    label: item.label,
    icon: item.icon,
    to: item.to,
    active: isActive(item),
    badge: badgeFor(item),
  })),
]))
</script>

<template>
  <UDashboardSidebar
    collapsible
    :ui="{ footer: 'border-t border-default' }"
  >
    <template #header="{ collapsed }">
      <NuxtLink
        to="/admin"
        class="truncate text-base font-semibold tracking-tight text-highlighted"
      >
        <template v-if="collapsed">LB</template>
        <template v-else>
          La Bendita
          <span class="ml-1 font-normal text-muted">Admin</span>
        </template>
      </NuxtLink>
    </template>

    <template #default="{ collapsed }">
      <UNavigationMenu
        :items="items"
        :collapsed="collapsed"
        orientation="vertical"
        tooltip
        aria-label="Panel"
      />
    </template>

    <template #footer="{ collapsed }">
      <div class="grid w-full gap-3">
        <div
          v-if="!collapsed"
          class="grid min-w-0"
        >
          <span class="truncate text-sm font-medium text-highlighted">{{ auth.user?.displayName }}</span>
          <span class="truncate text-xs text-muted">{{ auth.user?.email }}</span>
        </div>
        <AdminLogoutButton :collapsed="collapsed" />
      </div>
    </template>
  </UDashboardSidebar>
</template>
