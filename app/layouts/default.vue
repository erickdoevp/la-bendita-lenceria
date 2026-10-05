<script setup lang="ts">
import { StoreFooter, StoreHeader } from '~/features/store-shell'
</script>

<template>
  <div class="flex min-h-[100dvh] flex-col">
    <StoreHeader />
    <main class="flex-1">
      <slot />
    </main>
    <StoreFooter />
  </div>
</template>
