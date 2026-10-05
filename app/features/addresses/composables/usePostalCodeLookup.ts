import { useAddressesApi } from '../services'
import type { PostalCodeInfo } from '../types'

/**
 * Autocompleta municipio y estado al escribir 5 digitos en el CP.
 * Un 404 no es error: se deja capturar a mano.
 */
export function usePostalCodeLookup(cp: () => string, onFound: (info: PostalCodeInfo) => void) {
  const api = useAddressesApi()
  const status = ref<'idle' | 'pending' | 'found' | 'not-found'>('idle')
  let requestId = 0

  watch(cp, async (value, previous) => {
    const code = value.trim()
    if (!/^\d{5}$/.test(code)) {
      status.value = 'idle'
      return
    }
    // Al precargar el formulario no se pisan los datos ya guardados
    if (previous === undefined) return

    const id = ++requestId
    status.value = 'pending'
    try {
      const info = await api.postalCode(code)
      if (id !== requestId) return
      onFound(info)
      status.value = 'found'
    }
    catch {
      if (id === requestId) status.value = 'not-found'
    }
  }, { immediate: true })

  return { status }
}
