<script setup lang="ts">
import { AdminLogoutButton, useAuthStore } from '~/features/auth'
import { PRODUCT_ROUTES, useProductDraftStore } from '~/features/products'
import { REVIEW_ROUTES, useReviewsStore } from '~/features/reviews'
import { ADMIN_NAV } from '../constants'
import type { AdminNavItem } from '../constants'

const route = useRoute()
const auth = useAuthStore()
const draft = useProductDraftStore()
const reviews = useReviewsStore()

// Contador de resenas por moderar. El menu movil monta otra instancia: load() marca pending al instante
onMounted(() => {
  if (!reviews.pending.data && !reviews.pending.pending) void reviews.pending.load(0)
})

function isActive(item: AdminNavItem) {
  return item.exact ? route.path === item.to : route.path.startsWith(item.to)
}
</script>

<template>
  <div class="flex h-full flex-col">
    <NuxtLink
      to="/admin"
      class="flex h-16 shrink-0 items-center px-5 text-base font-semibold tracking-tight text-ink"
    >
      La Bendita
      <span class="ml-1.5 font-normal text-ink-muted">Admin</span>
    </NuxtLink>

    <nav
      class="flex-1 overflow-y-auto px-3 py-2"
      aria-label="Panel"
    >
      <div
        v-for="(group, index) in ADMIN_NAV"
        :key="group.label ?? index"
        class="grid gap-0.5 pb-5"
      >
        <p
          v-if="group.label"
          class="px-3 pb-1.5 text-xs font-medium text-ink-muted"
        >
          {{ group.label }}
        </p>
        <NuxtLink
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          :aria-current="isActive(item) ? 'page' : undefined"
          class="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent"
          :class="isActive(item) ? 'bg-accent/10 text-ink' : 'text-ink-muted hover:bg-surface hover:text-ink'"
        >
          <Icon
            :name="item.icon"
            class="size-5 shrink-0"
            :class="isActive(item) && 'text-accent'"
            aria-hidden="true"
          />
          <span class="flex-1">{{ item.label }}</span>
          <span
            v-if="item.to === PRODUCT_ROUTES.create && draft.isDirty && !draft.created"
            class="text-xs font-normal text-accent"
          >Borrador</span>
          <span
            v-else-if="item.to === REVIEW_ROUTES.moderation && reviews.pendingCount"
            class="rounded-full bg-accent px-1.5 text-xs font-normal tabular-nums text-accent-ink"
            :aria-label="`${reviews.pendingCount} por revisar`"
          >{{ reviews.pendingCount }}</span>
        </NuxtLink>
      </div>
    </nav>

    <div class="grid gap-3 border-t border-line p-4">
      <div class="grid min-w-0">
        <span class="truncate text-sm font-medium text-ink">{{ auth.user?.displayName }}</span>
        <span class="truncate text-xs text-ink-muted">{{ auth.user?.email }}</span>
      </div>
      <AdminLogoutButton class="justify-center" />
    </div>
  </div>
</template>
