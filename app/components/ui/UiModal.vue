<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
}>()

const open = defineModel<boolean>('open', { required: true })
const dialog = ref<HTMLDialogElement | null>(null)
const titleId = useId()

watch(open, (value) => {
  if (!dialog.value) return
  if (value && !dialog.value.open) dialog.value.showModal()
  if (!value && dialog.value.open) dialog.value.close()
}, { flush: 'post' })

onMounted(() => {
  if (open.value) dialog.value?.showModal()
})

function onBackdrop(event: MouseEvent) {
  if (event.target === dialog.value) open.value = false
}
</script>

<template>
  <!-- Teleport: evita <form> anidados cuando el modal se abre dentro de otro formulario -->
  <Teleport to="body">
    <dialog
      ref="dialog"
      :aria-labelledby="titleId"
      class="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface-raised p-0 text-ink shadow-[0_24px_64px_-16px_rgb(24_24_27/0.35)] backdrop:bg-ink/40 open:motion-safe:animate-[modal-in_180ms_ease-out]"
      @close="open = false"
      @click="onBackdrop"
    >
      <div class="grid gap-6 p-6">
        <header class="flex items-start justify-between gap-4">
          <div class="grid gap-1">
            <h2
              :id="titleId"
              class="text-lg font-semibold tracking-tight"
            >
              {{ props.title }}
            </h2>
            <p
              v-if="description"
              class="text-sm text-ink-muted"
            >
              {{ description }}
            </p>
          </div>
          <button
            type="button"
            class="grid size-9 shrink-0 place-items-center rounded-xl text-ink-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
            aria-label="Cerrar"
            @click="open = false"
          >
            <Icon
              name="ph:x"
              class="size-5"
              aria-hidden="true"
            />
          </button>
        </header>
        <slot v-if="open" />
      </div>
    </dialog>
  </Teleport>
</template>
