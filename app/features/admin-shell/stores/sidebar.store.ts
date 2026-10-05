import { defineStore } from 'pinia'

/** Estado del menu lateral en movil (en escritorio siempre esta visible). */
export const useSidebarStore = defineStore('admin-sidebar', () => {
  const mobileOpen = ref(false)
  const route = useRoute()

  watch(() => route.fullPath, () => {
    mobileOpen.value = false
  })

  return {
    mobileOpen,
    open: () => (mobileOpen.value = true),
    close: () => (mobileOpen.value = false),
  }
})
