/**
 * Reordenar una lista arrastrando (HTML5 drag & drop) o con botones subir/bajar
 * (teclado y pantallas tactiles, donde el drag nativo no funciona).
 * Mientras se arrastra se pinta un orden temporal; al soltar se llama a
 * `commit` con la lista completa una sola vez.
 */
export function useDragReorder<T>(
  source: () => T[],
  getKey: (item: T) => string,
  commit: (ordered: T[]) => Promise<void>,
) {
  const draft = ref<T[] | null>(null) as Ref<T[] | null>
  const dragging = ref<string | null>(null)
  const saving = ref(false)

  const items = computed(() => draft.value ?? source())

  function sameOrder(a: T[], b: T[]) {
    return a.length === b.length && a.every((item, i) => getKey(item) === getKey(b[i]!))
  }

  async function save(ordered: T[]) {
    if (sameOrder(ordered, source())) {
      draft.value = null
      return
    }
    draft.value = ordered
    saving.value = true
    try {
      await commit(ordered)
    }
    finally {
      // Si fallo, se vuelve al orden guardado; el que llama muestra el error
      draft.value = null
      saving.value = false
    }
  }

  function onDragStart(item: T, event: DragEvent) {
    if (saving.value) return event.preventDefault()
    dragging.value = getKey(item)
    draft.value = [...source()]
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', getKey(item))
    }
  }

  function onDragOver(target: T) {
    if (!dragging.value || !draft.value || getKey(target) === dragging.value) return
    const list = [...draft.value]
    const from = list.findIndex(i => getKey(i) === dragging.value)
    const to = list.findIndex(i => getKey(i) === getKey(target))
    if (from < 0 || to < 0) return
    const [moved] = list.splice(from, 1)
    list.splice(to, 0, moved!)
    draft.value = list
  }

  function onDragEnd() {
    if (!dragging.value) return
    dragging.value = null
    void save(draft.value ?? source())
  }

  function move(item: T, offset: -1 | 1) {
    const list = [...source()]
    const from = list.findIndex(i => getKey(i) === getKey(item))
    const to = from + offset
    if (from < 0 || to < 0 || to >= list.length) return Promise.resolve()
    const [moved] = list.splice(from, 1)
    list.splice(to, 0, moved!)
    return save(list)
  }

  return { items, dragging, saving, onDragStart, onDragOver, onDragEnd, move }
}
