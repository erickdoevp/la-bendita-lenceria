import { defineStore } from 'pinia'
import { UNDO_REMOVE_MS } from '../constants'
import { CartMockError } from '../mocks/cart.mock'
import { useCartApi } from '../services'
import type { AddToCartInput, Cart, CartLine } from '../types'
import { summarizeCart } from '../utils/cart-summary'

const messageOf = (error: unknown) =>
  error instanceof CartMockError ? error.message : parseApiError(error).message

/**
 * Bolsa de compras de la tienda y estado del panel lateral. Solo vive en el cliente:
 * el carrito depende del token de invitada o de la sesion, que no existen en el SSR.
 */
export const useCartStore = defineStore('store-cart', () => {
  const api = useCartApi()

  const cart = ref<Cart | null>(null)
  const status = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const loadError = ref<string | null>(null)
  const isOpen = ref(false)

  /** Lineas con una peticion en curso: se bloquean para no mandar cambios encimados. */
  const pending = ref<string[]>([])
  /** Error por linea (sin stock, la pieza ya no existe). */
  const lineErrors = ref<Record<string, string>>({})
  /** Ultima linea quitada, para poder deshacer. */
  const lastRemoved = ref<{ line: CartLine, index: number } | null>(null)
  let undoTimer: ReturnType<typeof setTimeout> | undefined
  let request: Promise<void> | null = null

  const lines = computed(() => cart.value?.lines ?? [])
  const summary = computed(() => summarizeCart(lines.value))
  const count = computed(() => summary.value.itemCount)

  async function load() {
    status.value = 'loading'
    loadError.value = null
    try {
      cart.value = await api.get()
      status.value = 'ready'
    }
    catch (e) {
      loadError.value = messageOf(e)
      status.value = 'error'
    }
    finally {
      request = null
    }
  }

  function ensureLoaded() {
    if (import.meta.server || status.value === 'ready') return Promise.resolve()
    request ??= load()
    return request
  }

  function open() {
    isOpen.value = true
    void ensureLoaded()
  }

  function close() {
    isOpen.value = false
  }

  const isPending = (lineId: string) => pending.value.includes(lineId)

  async function withLine(lineId: string, run: () => Promise<Cart>) {
    if (isPending(lineId)) return
    pending.value.push(lineId)
    const { [lineId]: _, ...rest } = lineErrors.value
    lineErrors.value = rest
    try {
      cart.value = await run()
    }
    catch (e) {
      lineErrors.value[lineId] = messageOf(e)
    }
    finally {
      pending.value = pending.value.filter(id => id !== lineId)
    }
  }

  /** Agrega y abre la bolsa. Lanza el mensaje listo para mostrarse junto al boton. */
  async function add(input: AddToCartInput) {
    try {
      await ensureLoaded()
      cart.value = await api.add(input)
      status.value = 'ready'
      clearUndo()
      isOpen.value = true
    }
    catch (e) {
      throw new Error(messageOf(e), { cause: e })
    }
  }

  const setQuantity = (lineId: string, quantity: number) =>
    withLine(lineId, () => api.update(lineId, quantity))

  async function remove(lineId: string) {
    const index = lines.value.findIndex(l => l.id === lineId)
    const line = lines.value[index]
    if (!line) return
    await withLine(lineId, () => api.remove(lineId))
    if (lineErrors.value[lineId]) return
    clearUndo()
    lastRemoved.value = { line, index }
    undoTimer = setTimeout(clearUndo, UNDO_REMOVE_MS)
  }

  async function undoRemove() {
    const removed = lastRemoved.value
    if (!removed) return
    clearUndo()
    await withLine(removed.line.id, () => api.restore(removed.line, removed.index))
  }

  /** Sincroniza la bolsa con lo que hizo el backend al crear o cancelar una orden. */
  async function syncWithOrder(event: 'created' | 'canceled') {
    clearUndo()
    try {
      cart.value = event === 'created' ? await api.afterCheckout() : await api.afterOrderCanceled()
      status.value = 'ready'
    }
    catch {
      // Si falla, la proxima apertura de la bolsa la vuelve a pedir
      status.value = 'idle'
    }
  }

  function clearUndo() {
    clearTimeout(undoTimer)
    lastRemoved.value = null
  }

  return {
    cart,
    status,
    loadError,
    isOpen,
    lineErrors,
    lastRemoved,
    lines,
    summary,
    count,
    ensureLoaded,
    reload: load,
    open,
    close,
    isPending,
    add,
    setQuantity,
    remove,
    undoRemove,
    clearUndo,
    syncWithOrder,
  }
})
