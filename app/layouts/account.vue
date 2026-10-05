<script setup lang="ts">
import { AccountNav } from '~/features/account'
import { StoreHeader } from '~/features/store-shell'
</script>

<template>
  <div class="min-h-[100dvh] bg-surface">
    <StoreHeader />
    <div class="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10 lg:px-10 lg:py-10">
      <aside class="lg:sticky lg:top-24 lg:self-start">
        <AccountNav />
      </aside>
      <main class="min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>
