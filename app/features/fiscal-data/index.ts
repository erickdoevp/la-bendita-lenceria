// API publica del feature fiscal-data (perfiles de facturacion del cliente).
// Fuera del feature, importa solo desde aqui.
export { default as FiscalProfileForm } from './components/FiscalProfileForm.vue'
export { default as FiscalProfilesManager } from './components/FiscalProfilesManager.vue'
export { regimenLabel } from './constants'
export { useFiscalStore } from './stores/fiscal.store'
export type { FiscalProfile } from './types'
