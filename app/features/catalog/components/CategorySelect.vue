<script setup lang="ts">
import { useCategoriesStore } from '../stores/categories.store'
import type { CategoryRef } from '../types'
import { flattenCategoryTree, withoutBranch } from '../utils/category-tree'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  invalid?: boolean
  emptyLabel?: string
  /** Oculta esta categoria y sus hijas (al editar, no puede ser su propio padre). */
  excludeId?: string
  /** Valor actual que puede no estar en el arbol (el arbol solo trae activas). */
  current?: CategoryRef | null
}>(), { emptyLabel: 'Elige una categoría', excludeId: undefined, current: null })

const model = defineModel<string>({ required: true })
const store = useCategoriesStore()

const options = computed(() => {
  const list = props.excludeId ? flattenCategoryTree(withoutBranch(store.tree, props.excludeId)) : store.options
  const current = props.current
  if (!current || list.some(option => option.id === current.id)) return list
  return [...list, { id: current.id, name: `${current.name} (inactiva)`, depth: 0, path: current.name }]
})

const indent = (depth: number) => '   '.repeat(depth)
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
      v-for="option in options"
      :key="option.id"
      :value="option.id"
    >
      {{ indent(option.depth) }}{{ option.name }}
    </option>
  </UiSelect>
</template>
