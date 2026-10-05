<script setup lang="ts">
import type { AuthUser } from '#shared/types/auth'

const props = withDefaults(defineProps<{
  user: Pick<AuthUser, 'name' | 'firstLastName' | 'avatarImgUrl'>
  size?: 'sm' | 'lg'
}>(), { size: 'sm' })

const initials = computed(() =>
  [props.user.name, props.user.firstLastName].map(part => part?.trim()[0] ?? '').join('').toUpperCase(),
)
</script>

<template>
  <span
    class="grid shrink-0 place-items-center overflow-hidden rounded-full bg-accent/10 font-medium text-accent"
    :class="size === 'sm' ? 'size-8 text-xs' : 'size-20 text-xl'"
    aria-hidden="true"
  >
    <img
      v-if="user.avatarImgUrl"
      :src="user.avatarImgUrl"
      alt=""
      class="size-full object-cover"
    >
    <template v-else>{{ initials }}</template>
  </span>
</template>
