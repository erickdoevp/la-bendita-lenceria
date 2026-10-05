<script setup lang="ts">
import { AdminMobileNav, AdminSidebarNav } from '~/features/admin-shell'
</script>

<template>
  <div class="min-h-[100dvh] bg-surface">
    <aside class="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface-raised lg:block">
      <AdminSidebarNav />
    </aside>

    <div class="lg:pl-64">
      <AdminMobileNav />
      <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <slot />
      </main>
    </div>
  </div>
</template>
