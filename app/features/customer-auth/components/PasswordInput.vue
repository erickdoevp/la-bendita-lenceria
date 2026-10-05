<script setup lang="ts">
// Los atributos (autocomplete, aria-*) llegan al <input> a traves de UInput
const model = defineModel<string>({ required: true })
const visible = ref(false)
</script>

<template>
  <UInput
    v-model="model"
    :type="visible ? 'text' : 'password'"
    :ui="{ trailing: 'pe-1' }"
  >
    <template #trailing>
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        :icon="visible ? 'ph:eye-slash' : 'ph:eye'"
        :aria-label="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        :aria-pressed="visible"
        @click="visible = !visible"
      />
    </template>
  </UInput>
</template>
