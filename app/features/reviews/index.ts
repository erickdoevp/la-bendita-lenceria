// API publica del feature reviews. Fuera del feature, importa solo desde aqui.
export { default as RatingStars } from './components/RatingStars.vue'
export { default as ReviewsModeration } from './components/ReviewsModeration.vue'
export { REVIEW_ROUTES } from './constants'
export { useReviewsStore } from './stores/reviews.store'
export type { Review, ReviewStats } from './types'
