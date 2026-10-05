export type LoadStatus = 'idle' | 'pending' | 'ready' | 'error'

/** Lista completa de un catalogo (para selects); se pide una vez y se reutiliza. */
export function createResource<T>(fetcher: () => Promise<T>, initial: T) {
  const data = ref(initial) as Ref<T>
  const status = ref<LoadStatus>('idle')
  const error = ref<string | null>(null)
  let inflight: Promise<void> | null = null

  function load(force = false): Promise<void> {
    if (!force && status.value === 'ready') return Promise.resolve()
    inflight ??= (async () => {
      if (status.value !== 'ready') status.value = 'pending'
      error.value = null
      try {
        data.value = await fetcher()
        status.value = 'ready'
      }
      catch (e) {
        error.value = parseApiError(e).message
        status.value = 'error'
      }
    })().finally(() => {
      inflight = null
    })
    return inflight
  }

  return { data, status, error, load }
}
