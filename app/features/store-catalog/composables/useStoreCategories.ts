import { useStoreCategoriesStore } from '../stores/store-categories.store'

/**
 * Asegura el arbol de categorias antes de pintar (tambien en SSR) y devuelve el store.
 * Varias llamadas en la misma pagina comparten la misma peticion.
 */
export async function useStoreCategories() {
  const store = useStoreCategoriesStore()
  await useAsyncData('store-categories', () => store.ensureLoaded().then(() => true))
  return store
}
