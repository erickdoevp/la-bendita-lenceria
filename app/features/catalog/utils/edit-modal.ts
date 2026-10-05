/** Registro en edicion dentro de un UiModal: el modal esta abierto mientras haya uno. */
export function useEditModal<T>() {
  const editing = shallowRef<T | null>(null)
  const open = computed({
    get: () => editing.value !== null,
    set: (value) => {
      if (!value) editing.value = null
    },
  })
  return { editing, open }
}
