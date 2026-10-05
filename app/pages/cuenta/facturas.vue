<script setup lang="ts">
import { InvoicesManager } from '~/features/invoices'

definePageMeta({
  layout: 'account',
  middleware: 'customer',
})

useSeoMeta({
  title: 'Mis facturas | La Bendita Lencería',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <InvoicesManager />
</template>
