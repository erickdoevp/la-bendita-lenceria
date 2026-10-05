<script setup lang="ts">
import type { StoreProductDetail } from '../types'

defineProps<{ product: StoreProductDetail }>()
</script>

<template>
  <div class="border-t border-line">
    <details
      class="group/detail border-b border-line"
      open
    >
      <summary class="flex cursor-pointer list-none items-center justify-between gap-3 py-5 font-medium text-ink focus-visible:outline-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
        Descripción
        <Icon
          name="ph:plus"
          class="size-4 text-ink-muted transition-transform duration-200 group-open/detail:rotate-45"
          aria-hidden="true"
        />
      </summary>
      <div class="grid gap-4 pb-6">
        <p
          v-for="(paragraph, index) in product.description"
          :key="index"
          class="max-w-[60ch] leading-relaxed text-ink-muted"
        >
          {{ paragraph }}
        </p>
        <ul class="grid gap-2">
          <li
            v-for="highlight in product.highlights"
            :key="highlight"
            class="flex items-center gap-2.5 text-sm text-ink"
          >
            <Icon
              name="ph:check"
              class="size-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            {{ highlight }}
          </li>
        </ul>
      </div>
    </details>

    <details class="group/detail border-b border-line">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-3 py-5 font-medium text-ink focus-visible:outline-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
        Materiales y cuidados
        <Icon
          name="ph:plus"
          class="size-4 text-ink-muted transition-transform duration-200 group-open/detail:rotate-45"
          aria-hidden="true"
        />
      </summary>
      <div class="grid gap-4 pb-6">
        <p class="leading-relaxed text-ink-muted">
          {{ product.materials }}
        </p>
        <ul class="grid gap-2">
          <li
            v-for="item in product.care"
            :key="item"
            class="flex items-center gap-2.5 text-sm text-ink"
          >
            <Icon
              name="ph:drop"
              class="size-4 shrink-0 text-ink-muted"
              aria-hidden="true"
            />
            {{ item }}
          </li>
        </ul>
      </div>
    </details>

    <details class="group/detail border-b border-line">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-3 py-5 font-medium text-ink focus-visible:outline-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
        Envíos y cambios
        <Icon
          name="ph:plus"
          class="size-4 text-ink-muted transition-transform duration-200 group-open/detail:rotate-45"
          aria-hidden="true"
        />
      </summary>
      <!-- TODO: confirmar plazos con la politica real de la tienda -->
      <div class="grid max-w-[60ch] gap-3 pb-6 leading-relaxed text-ink-muted">
        <p>Enviamos a todo México en 3 a 6 días hábiles. El envío es gratis en compras desde $999.</p>
        <p>Si la talla no te quedó, puedes cambiarla sin costo durante 30 días. Por higiene, las panties y los bodies solo se cambian con la etiqueta y el protector puestos.</p>
      </div>
    </details>
  </div>
</template>
