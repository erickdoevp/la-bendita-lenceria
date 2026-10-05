<script setup lang="ts">
import { CustomerMenu } from '~/features/customer-auth'
import { STORE_ROUTES } from '~/features/store-catalog'
import { STORE_ANNOUNCEMENT, STORE_NAV_LINKS } from '../constants'
import StoreMobileMenu from './StoreMobileMenu.vue'

const route = useRoute()
const menuOpen = ref(false)

// TODO: leer del store del carrito cuando exista
const cartCount = 0

const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)
</script>

<template>
  <div class="bg-accent text-accent-ink">
    <p class="mx-auto flex h-10 max-w-7xl items-center justify-center px-4 text-center text-[13px] font-medium">
      {{ STORE_ANNOUNCEMENT }}
    </p>
  </div>

  <header class="sticky top-0 z-20 border-b border-line bg-surface-raised/95 backdrop-blur">
    <div class="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr] lg:grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-10">
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="-ml-2 grid size-10 place-items-center rounded-xl text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent lg:hidden"
          aria-label="Abrir menú"
          :aria-expanded="menuOpen"
          @click="menuOpen = true"
        >
          <Icon
            name="ph:list"
            class="size-5"
            aria-hidden="true"
          />
        </button>
        <NuxtLink
          :to="STORE_ROUTES.home"
          class="whitespace-nowrap text-lg font-semibold tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          La Bendita
        </NuxtLink>
      </div>

      <nav
        aria-label="Principal"
        class="hidden lg:block"
      >
        <ul class="flex items-center gap-1">
          <li
            v-for="link in STORE_NAV_LINKS"
            :key="link.to"
          >
            <NuxtLink
              :to="link.to"
              class="inline-flex h-10 items-center whitespace-nowrap rounded-xl px-3.5 text-sm font-medium transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
              :class="isActive(link.to) ? 'text-accent' : 'text-ink-muted'"
              :aria-current="isActive(link.to) ? 'page' : undefined"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center justify-end gap-1">
        <NuxtLink
          :to="STORE_ROUTES.search"
          class="grid size-10 place-items-center rounded-xl text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Buscar"
        >
          <Icon
            name="ph:magnifying-glass"
            class="size-5"
            aria-hidden="true"
          />
        </NuxtLink>
        <div class="hidden sm:block">
          <CustomerMenu />
        </div>
        <NuxtLink
          :to="STORE_ROUTES.cart"
          class="relative grid size-10 place-items-center rounded-xl text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
          :aria-label="cartCount ? `Carrito, ${cartCount} artículos` : 'Carrito'"
        >
          <Icon
            name="ph:handbag"
            class="size-5"
            aria-hidden="true"
          />
          <span
            v-if="cartCount"
            class="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-4 text-accent-ink"
            aria-hidden="true"
          >{{ cartCount }}</span>
        </NuxtLink>
      </div>
    </div>

    <StoreMobileMenu v-model:open="menuOpen" />
  </header>
</template>
