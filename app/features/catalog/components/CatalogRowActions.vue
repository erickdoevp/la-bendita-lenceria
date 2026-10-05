<script setup lang="ts">
// Sin default, Vue convierte un boolean ausente en false y ocultaria los botones
const props = withDefaults(defineProps<{
  name: string
  deleting?: boolean
  editable?: boolean
  deletable?: boolean
}>(), { editable: true, deletable: true })

const emit = defineEmits<{ edit: [], delete: [] }>()
const confirming = ref(false)

watch(() => props.deleting, (value, previous) => {
  if (previous && !value) confirming.value = false
})
</script>

<template>
  <div class="flex items-center justify-end gap-1">
    <template v-if="confirming">
      <span class="mr-1 text-sm text-ink-muted">¿Eliminar?</span>
      <UiButton
        variant="danger"
        size="sm"
        :loading="deleting"
        @click="emit('delete')"
      >
        Sí, eliminar
      </UiButton>
      <UiButton
        variant="ghost"
        size="sm"
        :disabled="deleting"
        @click="confirming = false"
      >
        No
      </UiButton>
    </template>
    <template v-else>
      <UiButton
        v-if="editable"
        variant="ghost"
        size="sm"
        icon="ph:pencil-simple"
        :aria-label="`Editar ${name}`"
        @click="emit('edit')"
      />
      <UiButton
        v-if="deletable"
        variant="ghost"
        size="sm"
        icon="ph:trash"
        :aria-label="`Eliminar ${name}`"
        @click="confirming = true"
      />
    </template>
  </div>
</template>
