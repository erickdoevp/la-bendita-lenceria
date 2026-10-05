<script setup lang="ts">
const props = defineProps<{
  file: File
  primary?: boolean
  canPromote?: boolean
}>()

const emit = defineEmits<{ remove: [], makePrimary: [] }>()
const url = useObjectUrl(() => props.file)
</script>

<template>
  <li class="grid gap-1.5">
    <div class="relative aspect-[4/5] overflow-hidden rounded-lg border border-default bg-muted">
      <img
        v-if="url"
        :src="url"
        :alt="file.name"
        class="size-full object-cover"
      >
      <UButton
        color="neutral"
        variant="solid"
        size="xs"
        icon="ph:trash"
        class="absolute right-1.5 top-1.5"
        :aria-label="`Quitar ${file.name}`"
        @click="emit('remove')"
      />
    </div>
    <p
      v-if="primary"
      class="flex items-center gap-1 text-xs font-medium text-primary"
    >
      <UIcon
        name="ph:star-fill"
        class="size-3.5"
      />
      Principal
    </p>
    <UButton
      v-else-if="canPromote"
      color="neutral"
      variant="link"
      size="xs"
      label="Hacer principal"
      class="justify-self-start px-0"
      @click="emit('makePrimary')"
    />
    <p
      v-else
      class="text-xs text-muted"
    >
      {{ formatBytes(file.size) }}
    </p>
  </li>
</template>
