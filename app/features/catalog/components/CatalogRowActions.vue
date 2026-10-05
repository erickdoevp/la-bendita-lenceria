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
      <span class="mr-1 text-sm text-muted">¿Eliminar?</span>
      <UButton
        color="error"
        variant="soft"
        size="sm"
        label="Sí, eliminar"
        :loading="deleting"
        @click="emit('delete')"
      />
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        label="No"
        :disabled="deleting"
        @click="confirming = false"
      />
    </template>
    <template v-else>
      <UButton
        v-if="editable"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="ph:pencil-simple"
        :aria-label="`Editar ${name}`"
        @click="emit('edit')"
      />
      <UButton
        v-if="deletable"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="ph:trash"
        :aria-label="`Eliminar ${name}`"
        @click="confirming = true"
      />
    </template>
  </div>
</template>
