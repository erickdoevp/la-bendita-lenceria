<script setup lang="ts">
import { FiscalProfilesManager } from '~/features/fiscal-data'

definePageMeta({
  layout: 'account',
  middleware: 'customer',
})

useSeoMeta({
  title: 'Datos fiscales | La Bendita Lencería',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <FiscalProfilesManager />
</template>
