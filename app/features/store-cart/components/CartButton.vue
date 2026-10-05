<script setup lang="ts">
import { useCartStore } from '../stores/cart.store'

const cart = useCartStore()

// La bolsa depende del navegador (token de invitada), asi que se pide despues de hidratar
onMounted(() => cart.ensureLoaded())
</script>

<template>
  <button
    type="button"
    class="relative grid size-10 place-items-center rounded-xl text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
    :aria-label="cart.count ? `Bolsa, ${cart.count} ${cart.count === 1 ? 'pieza' : 'piezas'}` : 'Bolsa'"
    aria-haspopup="dialog"
    :aria-expanded="cart.isOpen"
    @click="cart.open()"
  >
    <Icon
      name="ph:handbag"
      class="size-5"
      aria-hidden="true"
    />
    <Transition
      enter-from-class="scale-50 opacity-0"
      leave-to-class="scale-50 opacity-0"
      enter-active-class="transition-[opacity,transform] duration-200 ease-out"
      leave-active-class="transition-[opacity,transform] duration-150 ease-in"
    >
      <span
        v-if="cart.count"
        :key="cart.count"
        class="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-4 tabular-nums text-accent-ink"
        aria-hidden="true"
      >{{ cart.count > 99 ? '99+' : cart.count }}</span>
    </Transition>
  </button>
</template>
