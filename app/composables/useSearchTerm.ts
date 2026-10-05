/**
 * Texto de un buscador con debounce: el input se actualiza al instante y el
 * filtro (source/update) 300 ms despues de dejar de escribir.
 */
export function useSearchTerm(source: () => string, update: (value: string) => void, delay = 300) {
  const term = ref(source())
  let timer: ReturnType<typeof setTimeout> | undefined

  // Si el filtro se limpia desde fuera, el input tambien se vacia
  watch(source, (value) => {
    if (value !== term.value.trim()) term.value = value
  })

  watch(term, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => update(value.trim()), delay)
  })

  onBeforeUnmount(() => clearTimeout(timer))

  return term
}
