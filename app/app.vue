<script setup lang="ts">
import { es } from '@nuxt/ui/locale'
</script>

<template>
  <!-- UApp: proveedores de Nuxt UI (toasts, tooltips, overlays) y textos en espanol -->
  <UApp :locale="es">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
