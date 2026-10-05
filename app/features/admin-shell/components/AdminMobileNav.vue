<script setup lang="ts">
import { useSidebarStore } from '../stores/sidebar.store'
import AdminSidebarNav from './AdminSidebarNav.vue'

const sidebar = useSidebarStore()
const dialog = ref<HTMLDialogElement | null>(null)

// <dialog> modal: atrapa el foco y cierra con Escape sin codigo extra
watch(() => sidebar.mobileOpen, (open) => {
  if (open && !dialog.value?.open) dialog.value?.showModal()
  if (!open && dialog.value?.open) dialog.value.close()
}, { flush: 'post' })

function onClick(event: MouseEvent) {
  if (event.target === dialog.value) sidebar.close()
}
</script>

<template>
  <div class="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface-raised/95 px-4 backdrop-blur lg:hidden">
    <button
      type="button"
      class="grid size-10 place-items-center rounded-xl text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
      aria-label="Abrir menú"
      :aria-expanded="sidebar.mobileOpen"
      @click="sidebar.open()"
    >
      <Icon
        name="ph:list"
        class="size-5"
        aria-hidden="true"
      />
    </button>
    <NuxtLink
      to="/admin"
      class="text-base font-semibold tracking-tight text-ink"
    >
      La Bendita
      <span class="font-normal text-ink-muted">Admin</span>
    </NuxtLink>

    <dialog
      ref="dialog"
      aria-label="Menú del panel"
      class="m-0 h-[100dvh] max-h-none w-72 max-w-[85vw] border-r border-line bg-surface-raised p-0 text-ink backdrop:bg-ink/40 open:motion-safe:animate-[drawer-in_200ms_ease-out]"
      @close="sidebar.close()"
      @click="onClick"
    >
      <AdminSidebarNav />
    </dialog>
  </div>
</template>
