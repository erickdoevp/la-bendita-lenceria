<script setup lang="ts">
import { AccountOverview } from '~/features/account'

definePageMeta({
  layout: 'account',
  middleware: 'customer',
})

useSeoMeta({
  title: 'Mi cuenta | La Bendita Lencería',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <AccountOverview />
</template>
