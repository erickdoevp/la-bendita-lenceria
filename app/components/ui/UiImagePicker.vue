<script setup lang="ts">
const props = withDefaults(defineProps<{
  id: string
  multiple?: boolean
  label?: string
  error?: string
  compact?: boolean
}>(), {
  label: 'Arrastra imágenes o haz clic para elegir',
  error: undefined,
})

const files = defineModel<File[]>({ required: true })
const input = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const rejected = ref<string | null>(null)

function add(list: FileList | null) {
  if (!list?.length) return
  rejected.value = null
  const accepted: File[] = []
  for (const file of Array.from(list)) {
    const result = imageFileSchema.safeParse(file)
    if (result.success) accepted.push(file)
    else rejected.value = `${file.name}: ${result.error.issues[0]?.message}`
  }
  files.value = props.multiple ? [...files.value, ...accepted] : accepted.slice(0, 1)
  if (input.value) input.value.value = ''
}

function onDrop(event: DragEvent) {
  dragging.value = false
  add(event.dataTransfer?.files ?? null)
}

function remove(index: number) {
  files.value = files.value.filter((_, i) => i !== index)
}

function makePrimary(index: number) {
  const next = [...files.value]
  const [file] = next.splice(index, 1)
  if (file) files.value = [file, ...next]
}
</script>

<template>
  <div class="grid gap-3">
    <ul
      v-if="files.length"
      class="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3"
    >
      <UiImageThumb
        v-for="(file, index) in files"
        :key="`${file.name}-${file.lastModified}-${index}`"
        :file="file"
        :primary="multiple && index === 0"
        :can-promote="multiple"
        @remove="remove(index)"
        @make-primary="makePrimary(index)"
      />
    </ul>

    <label
      v-if="multiple || !files.length"
      :for="id"
      class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 text-sm transition-colors duration-200 focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/20"
      :class="[
        dragging ? 'border-accent bg-accent/5' : error ? 'border-danger' : 'border-line hover:border-ink-muted',
        compact ? 'py-3' : 'py-5',
      ]"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <Icon
        name="ph:image-square"
        class="size-6 shrink-0 text-ink-muted"
        aria-hidden="true"
      />
      <span class="grid gap-0.5">
        <span class="font-medium text-ink">{{ label }}</span>
        <span class="text-[13px] text-ink-muted">JPG, PNG, WebP o AVIF. Máximo 10 MB cada una.</span>
      </span>
      <input
        :id="id"
        ref="input"
        type="file"
        class="sr-only"
        :accept="IMAGE_ACCEPT"
        :multiple="multiple"
        @change="add(($event.target as HTMLInputElement).files)"
      >
    </label>

    <p
      v-if="rejected || error"
      class="text-[13px] text-danger"
    >
      {{ rejected ?? error }}
    </p>
  </div>
</template>
