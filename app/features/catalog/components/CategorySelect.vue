<script setup lang="ts">
import { useCategoriesStore } from '../stores/categories.store'
import type { CategoryRef } from '../types'
import { flattenCategoryTree, withoutBranch } from '../utils/category-tree'

const props = withDefaults(defineProps<{
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

// La sangria marca la profundidad en el arbol; '' (sin categoria) se representa con SELECT_ALL
const items = computed(() => [
  { label: store.status === 'pending' ? 'Cargando categorías' : props.emptyLabel, value: SELECT_ALL },
  ...options.value.map(option => ({ label: `${'\u00A0\u00A0\u00A0'.repeat(option.depth)}${option.name}`, value: option.id })),
])

const selected = computed({
  get: () => model.value || SELECT_ALL,
  set: (value: string) => {
    model.value = value === SELECT_ALL ? '' : value
  },
})
</script>

<template>
  <USelect
    v-model="selected"
    :items="items"
    :loading="store.status === 'pending'"
    :disabled="store.status === 'pending'"
  />
</template>
