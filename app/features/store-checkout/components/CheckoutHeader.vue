<script setup lang="ts">
import { STORE_ROUTES } from '~/features/store-catalog'
import { CartSlideover } from '~/features/store-cart'
</script>

<template>
  <!-- Sin navegacion: en el pago solo cuenta terminar la compra -->
  <header class="border-b border-line bg-surface-raised">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
      <NuxtLink
        :to="STORE_ROUTES.home"
        class="whitespace-nowrap text-lg font-semibold tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-accent"
      >
        La Bendita
      </NuxtLink>
      <p class="flex items-center gap-1.5 text-[13px] font-medium text-ink-muted">
        <Icon
          name="ph:lock-simple-bold"
          class="size-4"
          aria-hidden="true"
        />
        Pago seguro
      </p>
    </div>
    <CartSlideover />
  </header>
</template>
