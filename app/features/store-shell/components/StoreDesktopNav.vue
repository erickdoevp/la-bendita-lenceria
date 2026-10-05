<script setup lang="ts">
import type { NavCategory } from '../composables/useStoreNavigation'
import type { StoreNavLink } from '../constants'

defineProps<{
  roots: NavCategory[]
  leading: StoreNavLink[]
  trailing: StoreNavLink[]
}>()

const route = useRoute()
const openId = ref<string | null>(null)
let closeTimer: ReturnType<typeof setTimeout> | undefined

// Pequeno retraso al salir para que el cursor pueda bajar al panel sin que se cierre
function open(id: string) {
  clearTimeout(closeTimer)
  openId.value = id
}

function scheduleClose() {
  clearTimeout(closeTimer)
  closeTimer = setTimeout(() => (openId.value = null), 120)
}

function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (!(event.currentTarget as HTMLElement).contains(next)) openId.value = null
}

watch(() => route.fullPath, () => (openId.value = null))
onBeforeUnmount(() => clearTimeout(closeTimer))

const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)
const linkClass = 'inline-flex h-10 items-center gap-1 whitespace-nowrap rounded-xl px-3.5 text-sm font-medium transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-accent'
</script>

<template>
  <nav
    aria-label="Principal"
    class="hidden lg:block"
    @keydown.esc="openId = null"
  >
    <ul class="flex items-center gap-1">
      <li
        v-for="link in leading"
        :key="link.to"
      >
        <NuxtLink
          :to="link.to"
          :class="[linkClass, isActive(link.to) ? 'text-accent' : 'text-ink-muted']"
        >
          {{ link.label }}
        </NuxtLink>
      </li>

      <li
        v-for="root in roots"
        :key="root.id"
        @mouseenter="open(root.id)"
        @mouseleave="scheduleClose"
        @focusin="open(root.id)"
        @focusout="onFocusOut"
      >
        <NuxtLink
          :to="root.to"
          :class="[linkClass, isActive(root.to) ? 'text-accent' : 'text-ink-muted']"
          :aria-expanded="root.children.length ? openId === root.id : undefined"
          :aria-current="route.path === root.to ? 'page' : undefined"
        >
          {{ root.name }}
          <Icon
            v-if="root.children.length"
            name="ph:caret-down"
            class="size-3.5 transition-transform duration-200"
            :class="{ 'rotate-180': openId === root.id }"
            aria-hidden="true"
          />
        </NuxtLink>

        <!-- Panel a lo ancho bajo el header: subcategorias en columnas con sus tipos -->
        <div
          v-if="root.children.length"
          v-show="openId === root.id"
          class="absolute inset-x-0 top-full border-b border-line bg-surface-raised shadow-[0_24px_48px_-24px_rgb(24_24_27/0.18)] motion-safe:animate-[rise-in_220ms_cubic-bezier(0.16,1,0.3,1)]"
        >
          <div class="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_14rem] gap-10 px-10 py-8">
            <ul class="grid grid-cols-4 gap-x-8 gap-y-6">
              <li
                v-for="child in root.children"
                :key="child.id"
                class="grid content-start gap-2.5"
              >
                <NuxtLink
                  :to="child.to"
                  class="text-[15px] font-semibold text-ink hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {{ child.name }}
                </NuxtLink>
                <ul
                  v-if="child.children.length"
                  class="grid gap-2"
                >
                  <li
                    v-for="leaf in child.children"
                    :key="leaf.id"
                  >
                    <NuxtLink
                      :to="leaf.to"
                      class="text-sm text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      {{ leaf.name }}
                    </NuxtLink>
                  </li>
                </ul>
              </li>
            </ul>
            <NuxtLink
              :to="root.to"
              class="group/all flex flex-col justify-end gap-1 self-stretch rounded-2xl bg-accent/[0.07] p-5 ring-1 ring-accent/15 transition-colors hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent"
            >
              <span class="text-sm text-ink-muted">Ver todo</span>
              <span class="flex items-center justify-between gap-2 text-lg font-semibold tracking-tight text-ink">
                {{ root.name }}
                <Icon
                  name="ph:arrow-right"
                  class="size-4 text-accent transition-transform duration-200 group-hover/all:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </NuxtLink>
          </div>
        </div>
      </li>

      <li
        v-for="link in trailing"
        :key="link.to"
      >
        <NuxtLink
          :to="link.to"
          :class="[linkClass, isActive(link.to) ? 'text-accent' : 'text-ink-muted']"
        >
          {{ link.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
