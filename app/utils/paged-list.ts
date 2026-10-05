/**
 * Estado de un listado paginado del panel (/admin). Vive dentro de un store
 * para que filtros y pagina se conserven al navegar entre pantallas.
 */
export function createPagedList<T, Q extends object>(
  fetchPage: (query: Q & { page: number, size: number }) => Promise<Page<T>>,
  initialFilters: Q,
  pageSize = 10,
) {
  const filters = reactive({ ...initialFilters }) as Q
  const data = ref<Page<T> | null>(null) as Ref<Page<T> | null>
  const pending = ref(false)
  const error = ref<string | null>(null)
  let requestId = 0

  async function load(page = data.value?.page ?? 0) {
    const id = ++requestId
    pending.value = true
    error.value = null
    try {
      const result = await fetchPage({ ...filters, page, size: pageSize })
      if (id !== requestId) return
      // Si borramos el ultimo registro de una pagina, volvemos a la anterior
      if (!result.items.length && page > 0) return load(page - 1)
      data.value = result
    }
    catch (e) {
      if (id === requestId) error.value = parseApiError(e).message
    }
    finally {
      if (id === requestId) pending.value = false
    }
  }

  return { filters, data, pending, error, load }
}
