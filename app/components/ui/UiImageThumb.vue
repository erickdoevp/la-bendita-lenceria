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
    <div class="group relative aspect-[4/5] overflow-hidden rounded-xl border border-line bg-surface">
      <img
        v-if="url"
        :src="url"
        :alt="file.name"
        class="size-full object-cover"
      >
      <button
        type="button"
        class="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-lg bg-surface-raised/90 text-ink shadow-sm transition-colors hover:text-danger focus-visible:outline-2 focus-visible:outline-accent"
        :aria-label="`Quitar ${file.name}`"
        @click="emit('remove')"
      >
        <Icon
          name="ph:trash"
          class="size-4"
          aria-hidden="true"
        />
      </button>
    </div>
    <p
      v-if="primary"
      class="flex items-center gap-1 text-xs font-medium text-accent"
    >
      <Icon
        name="ph:star-fill"
        class="size-3.5"
        aria-hidden="true"
      />
      Principal
    </p>
    <button
      v-else-if="canPromote"
      type="button"
      class="justify-self-start text-xs text-ink-muted underline-offset-2 hover:text-ink hover:underline"
      @click="emit('makePrimary')"
    >
      Hacer principal
    </button>
    <p
      v-else
      class="text-xs text-ink-muted"
    >
      {{ formatBytes(file.size) }}
    </p>
  </li>
</template>
