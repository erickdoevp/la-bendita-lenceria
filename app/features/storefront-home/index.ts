// API publica del feature storefront-home (pagina de inicio de la tienda).
// Fuera del feature, importa solo desde aqui.
export { default as HomeView } from './components/HomeView.vue'
export { useHomeHero } from './composables/useHomeSection'
export type { HomeCategory, HomeCollection, HomeHeroContent } from './types'
