<script setup lang="ts">
import { useCategoriesStore } from '../stores/categories.store'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  invalid?: boolean
  emptyLabel?: string
}>(), { emptyLabel: 'Elige una categoría' })

const model = defineModel<string>({ required: true })
const store = useCategoriesStore()

const indent = (depth: number) => '   '.repeat(depth)
</script>

<template>
  <UiSelect
    v-model="model"
    v-bind="$attrs"
    :invalid="invalid"
    :disabled="store.status === 'pending'"
  >
    <option value="">
      {{ store.status === 'pending' ? 'Cargando categorías' : emptyLabel }}
    </option>
    <option
      v-for="option in store.options"
      :key="option.id"
      :value="option.id"
    >
      {{ indent(option.depth) }}{{ option.name }}
    </option>
  </UiSelect>
</template>
