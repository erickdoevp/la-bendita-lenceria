<script setup lang="ts">
const props = defineProps<{
  id: string
  label: string
  error?: string
}>()

const file = defineModel<File | null>({ required: true })
const url = useObjectUrl(file)
const rejected = ref<string | null>(null)

function onChange(event: Event) {
  const input = event.target as HTMLInputElement
  const picked = input.files?.[0]
  input.value = ''
  if (!picked) return
  const result = imageFileSchema.safeParse(picked)
  rejected.value = result.success ? null : (result.error.issues[0]?.message ?? 'Archivo no válido.')
  if (result.success) file.value = picked
}
</script>

<template>
  <div class="grid gap-1">
    <div
      v-if="url"
      class="flex items-center gap-1.5"
    >
      <img
        :src="url"
        :alt="`Foto propia: ${props.label}`"
        class="size-9 rounded-lg border border-line object-cover"
      >
      <button
        type="button"
        class="grid size-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface hover:text-danger focus-visible:outline-2 focus-visible:outline-accent"
        :aria-label="`Quitar foto propia de ${props.label}`"
        @click="file = null"
      >
        <Icon
          name="ph:x"
          class="size-4"
          aria-hidden="true"
        />
      </button>
    </div>
    <label
      v-else
      :for="id"
      class="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-line px-2.5 text-[13px] text-ink-muted transition-colors focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/20 hover:border-ink-muted hover:text-ink"
      :title="`Foto propia para ${props.label} (opcional)`"
    >
      <Icon
        name="ph:camera-plus"
        class="size-4"
        aria-hidden="true"
      />
      Foto
      <input
        :id="id"
        type="file"
        class="sr-only"
        :accept="IMAGE_ACCEPT"
        :aria-label="`Foto propia para ${props.label}`"
        @change="onChange"
      >
    </label>
    <p
      v-if="rejected || error"
      class="text-xs text-danger"
    >
      {{ rejected ?? error }}
    </p>
  </div>
</template>
