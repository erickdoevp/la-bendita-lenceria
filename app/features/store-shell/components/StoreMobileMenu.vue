<script setup lang="ts">
import { CustomerMenu } from '~/features/customer-auth'
import type { NavCategory } from '../composables/useStoreNavigation'
import type { StoreNavLink } from '../constants'

defineProps<{
  roots: NavCategory[]
  leading: StoreNavLink[]
  trailing: StoreNavLink[]
}>()

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
            v-for="link in leading"
            :key="link.to"
          >
            <NuxtLink
              :to="link.to"
              class="flex h-12 items-center rounded-xl px-3 text-lg font-medium transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
            >
              {{ link.label }}
            </NuxtLink>
          </li>

          <!-- Cada raiz se despliega con sus subcategorias; el tercer nivel queda en el listado -->
          <li
            v-for="root in roots"
            :key="root.id"
          >
            <details class="group/root">
              <summary class="flex h-12 cursor-pointer list-none items-center justify-between rounded-xl px-3 text-lg font-medium transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
                {{ root.name }}
                <Icon
                  name="ph:caret-down"
                  class="size-4 text-ink-muted transition-transform duration-200 group-open/root:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <ul class="grid gap-0.5 pb-2 pl-3">
                <li>
                  <NuxtLink
                    :to="root.to"
                    class="flex h-10 items-center rounded-xl px-3 text-[15px] font-medium text-accent hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    Ver todo {{ root.name.toLowerCase() }}
                  </NuxtLink>
                </li>
                <li
                  v-for="child in root.children"
                  :key="child.id"
                >
                  <NuxtLink
                    :to="child.to"
                    class="flex h-10 items-center rounded-xl px-3 text-[15px] text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    {{ child.name }}
                  </NuxtLink>
                </li>
              </ul>
            </details>
          </li>

          <li
            v-for="link in trailing"
            :key="link.to"
          >
            <NuxtLink
              :to="link.to"
              class="flex h-12 items-center rounded-xl px-3 text-lg font-medium transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
            >
              {{ link.label }}
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
