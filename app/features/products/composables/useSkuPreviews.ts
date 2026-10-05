import { useProductsApi } from '../services'
import { useProductDraftStore } from '../stores/product-draft.store'

const DEBOUNCE_MS = 500

/**
 * Pide al backend el SKU que generaria cada variante (solo vista previa, no
 * reserva nada). Se recalcula cuando cambia el nombre o la matriz.
 */
export function useSkuPreviews() {
  const api = useProductsApi()
  const draft = useProductDraftStore()
  const pending = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  let requestId = 0

  async function refresh() {
    const id = ++requestId
    const name = draft.form.name.trim()
    if (name.length < 2 || !draft.variants.length) {
      draft.skuPreviews = {}
      pending.value = false
      return
    }

    const results = await Promise.allSettled(draft.variants.map(async v =>
      [v.key, (await api.skuPreview({ name, sizeId: v.sizeId, colorId: v.colorId })).sku] as const,
    ))
    if (id !== requestId) return

    draft.skuPreviews = Object.fromEntries(results.flatMap(r => (r.status === 'fulfilled' ? [r.value] : [])))
    pending.value = false
  }

  watch(
    () => [draft.form.name, draft.variants.map(v => v.key).join('|')],
    () => {
      clearTimeout(timer)
      pending.value = true
      timer = setTimeout(refresh, DEBOUNCE_MS)
    },
    { immediate: true },
  )

  onScopeDispose(() => clearTimeout(timer))

  return { pending }
}
