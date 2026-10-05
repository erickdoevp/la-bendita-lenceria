<script setup lang="ts">
import { CustomerMenu } from '~/features/customer-auth'
import { STORE_NAV_LINKS } from '../constants'

const open = defineModel<boolean>('open', { required: true })
const dialog = ref<HTMLDialogElement | null>(null)
const route = useRoute()

// <dialog> modal: atrapa el foco y cierra con Escape sin codigo extra
watch(open, (value) => {
  if (value && !dialog.value?.open) dialog.value?.showModal()
  if (!value && dialog.value?.open) dialog.value.close()
}, { flush: 'post' })

watch(() => route.fullPath, () => {
  open.value = false
})

function onClick(event: MouseEvent) {
  if (event.target === dialog.value) open.value = false
}
</script>

<template>
  <dialog
    ref="dialog"
    aria-label="Menú de la tienda"
    class="m-0 h-[100dvh] max-h-none w-80 max-w-[85vw] border-r border-line bg-surface-raised p-0 text-ink backdrop:bg-ink/40 open:motion-safe:animate-[drawer-in_200ms_ease-out]"
    @close="open = false"
    @click="onClick"
  >
    <div class="flex h-full flex-col">
      <div class="flex h-16 items-center justify-between border-b border-line px-4">
        <span class="text-lg font-semibold tracking-tight">La Bendita</span>
        <button
          type="button"
          class="grid size-10 place-items-center rounded-xl transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Cerrar menú"
          @click="open = false"
        >
          <Icon
            name="ph:x"
            class="size-5"
            aria-hidden="true"
          />
        </button>
      </div>

      <nav
        aria-label="Principal"
        class="flex-1 overflow-y-auto px-2 py-4"
      >
        <ul class="grid gap-1">
          <li
            v-for="link in STORE_NAV_LINKS"
            :key="link.to"
          >
            <NuxtLink
              :to="link.to"
              class="flex h-12 items-center justify-between rounded-xl px-3 text-lg font-medium transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
            >
              {{ link.label }}
              <Icon
                name="ph:caret-right"
                class="size-4 text-ink-muted"
                aria-hidden="true"
              />
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="border-t border-line p-4">
        <CustomerMenu />
      </div>
    </div>
  </dialog>
</template>
