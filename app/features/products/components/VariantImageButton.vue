<script setup lang="ts">
const props = defineProps<{
  id: string
  label: string
  error?: string
}>()

const file = defineModel<File | null>({ required: true })
const url = useObjectUrl(file)
const rejected = ref<string | null>(null)
const input = ref<HTMLInputElement | null>(null)

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
        class="size-8 rounded-md border border-default object-cover"
      >
      <UButton
        color="neutral"
        variant="ghost"
        icon="ph:x"
        :aria-label="`Quitar foto propia de ${props.label}`"
        @click="file = null"
      />
    </div>
    <template v-else>
      <UButton
        color="neutral"
        variant="outline"
        icon="ph:camera-plus"
        label="Foto"
        :title="`Foto propia para ${props.label} (opcional)`"
        :aria-label="`Foto propia para ${props.label}`"
        @click="input?.click()"
      />
      <input
        :id="id"
        ref="input"
        type="file"
        class="sr-only"
        tabindex="-1"
        :accept="IMAGE_ACCEPT"
        @change="onChange"
      >
    </template>
    <p
      v-if="rejected || error"
      class="text-xs text-error"
    >
      {{ rejected ?? error }}
    </p>
  </div>
</template>
