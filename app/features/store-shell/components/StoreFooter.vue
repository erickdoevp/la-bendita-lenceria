<script setup lang="ts">
import { useStoreNavigation } from '../composables/useStoreNavigation'
import { STORE_FOOTER_GROUPS, STORE_SOCIAL_LINKS } from '../constants'

const year = new Date().getFullYear()
const { roots, leading } = await useStoreNavigation()

// El grupo "Tienda" se arma con las categorias raiz del backend
const groups = computed(() => [
  { title: 'Tienda', links: [...leading, ...roots.value.map(root => ({ label: root.name, to: root.to }))] },
  ...STORE_FOOTER_GROUPS,
])
</script>

<template>
  <footer class="border-t border-line bg-surface-raised">
    <div class="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:px-10 lg:py-20">
      <div class="grid content-start justify-items-start gap-5">
        <NuxtLink
          to="/"
          class="text-2xl font-semibold tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          La Bendita
        </NuxtLink>
        <p class="max-w-[34ch] text-sm leading-relaxed text-ink-muted">
          Lencería cómoda y delicada, con envíos a todo México.
        </p>
        <ul class="flex items-center gap-1">
          <li
            v-for="social in STORE_SOCIAL_LINKS"
            :key="social.label"
          >
            <a
              :href="social.href"
              target="_blank"
              rel="noopener noreferrer"
              class="grid size-10 place-items-center rounded-xl text-ink-muted transition-colors hover:bg-surface hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
              :aria-label="social.label"
            >
              <Icon
                :name="social.icon"
                class="size-5"
                aria-hidden="true"
              />
            </a>
          </li>
        </ul>
      </div>

      <nav
        aria-label="Pie de página"
        class="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3"
      >
        <div
          v-for="group in groups"
          :key="group.title"
          class="grid content-start gap-4"
        >
          <h2 class="text-sm font-semibold text-ink">
            {{ group.title }}
          </h2>
          <ul class="grid gap-2.5">
            <li
              v-for="link in group.links"
              :key="link.to"
            >
              <NuxtLink
                :to="link.to"
                class="text-sm text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <div class="border-t border-line">
      <div class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-[13px] text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <p>© {{ year }} La Bendita Lencería</p>
        <ul
          class="flex items-center gap-2 text-ink"
          aria-label="Métodos de pago"
        >
          <li title="Tarjeta de crédito o débito">
            <Icon
              name="ph:credit-card"
              class="size-6"
              aria-label="Tarjeta"
            />
          </li>
          <li title="Transferencia">
            <Icon
              name="ph:bank"
              class="size-6"
              aria-label="Transferencia"
            />
          </li>
          <li title="Efectivo">
            <Icon
              name="ph:money"
              class="size-6"
              aria-label="Efectivo"
            />
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>
