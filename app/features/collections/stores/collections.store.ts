import { defineStore } from 'pinia'
import { useCollectionsApi } from '../services'
import type { Collection } from '../types'

/**
 * Todas las colecciones en orden de tienda. Reordenar exige mandar la lista
 * completa, asi que se cargan todas (son pocas) y se filtra en el front.
 */
export const useCollectionsStore = defineStore('collections', () => {
  const api = useCollectionsApi()
  const items = ref<Collection[]>([])
  const loaded = ref(false)
  const pending = ref(false)
  const error = ref<string | null>(null)
  const search = ref('')

  const filtered = computed(() => {
    const term = slugify(search.value)
    if (!term) return items.value
    return items.value.filter(c => slugify(c.name).includes(term) || c.slug.includes(term))
  })

  /** Para que una coleccion nueva quede al final de la tienda. */
  const nextPosition = computed(() =>
    items.value.length ? Math.max(...items.value.map(c => c.position)) + 1 : 0,
  )

  async function load() {
    pending.value = true
    error.value = null
    try {
      items.value = (await api.list({ page: 0, size: 1000, sort: 'position,asc' })).items
      loaded.value = true
    }
    catch (e) {
      error.value = parseApiError(e).message
    }
    finally {
      pending.value = false
    }
  }

  function ensureLoaded() {
    return loaded.value ? Promise.resolve() : load()
  }

  function upsert(collection: Collection) {
    const exists = items.value.some(c => c.id === collection.id)
    items.value = exists
      ? items.value.map(c => (c.id === collection.id ? collection : c))
      : [...items.value, collection]
  }

  /** Cambia el numero de productos sin recargar (el detalle no trae productCount). */
  function setProductCount(collectionId: string, productCount: number) {
    items.value = items.value.map(c => (c.id === collectionId ? { ...c, productCount } : c))
  }

  async function reorder(ordered: Collection[]) {
    try {
      items.value = await api.reorder(ordered.map(c => c.id))
    }
    catch (e) {
      // Alguien creo o borro una coleccion mientras tanto: la lista ya no cuadra
      if (parseApiError(e).status === 400) void load()
      throw e
    }
  }

  async function remove(collectionId: string) {
    await api.remove(collectionId)
    items.value = items.value.filter(c => c.id !== collectionId)
  }

  return {
    items, filtered, search, nextPosition, loaded, pending, error,
    load, ensureLoaded, upsert, setProductCount, reorder, remove,
  }
})
