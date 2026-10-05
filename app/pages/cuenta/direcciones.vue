<script setup lang="ts">
import { AddressesManager } from '~/features/addresses'

definePageMeta({
  layout: 'account',
  middleware: 'customer',
})

useSeoMeta({
  title: 'Mis direcciones | La Bendita Lencería',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <AddressesManager />
</template>
