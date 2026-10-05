<script setup lang="ts">
import { CheckoutHeader } from '~/features/store-checkout'
</script>

<template>
  <div class="flex min-h-[100dvh] flex-col bg-surface">
    <CheckoutHeader />
    <main class="flex-1">
      <slot />
    </main>
    <footer class="border-t border-line">
      <nav
        aria-label="Legal"
        class="mx-auto flex max-w-6xl flex-wrap gap-x-5 gap-y-2 px-4 py-6 text-[13px] text-ink-muted sm:px-6 lg:px-10"
      >
        <NuxtLink
          to="/ayuda/cambios"
          class="hover:text-ink"
        >Cambios y devoluciones</NuxtLink>
        <NuxtLink
          to="/legal/privacidad"
          class="hover:text-ink"
        >Aviso de privacidad</NuxtLink>
        <NuxtLink
          to="/legal/terminos"
          class="hover:text-ink"
        >Términos y condiciones</NuxtLink>
      </nav>
    </footer>
  </div>
</template>
