import { defineStore } from 'pinia'
import { REVIEW_SORTS, emptyReviewFilters } from '../constants'
import { useReviewsApi } from '../services'
import type { ModerationTab } from '../types'

/**
 * Moderacion: cola de pendientes y listado completo con filtros. En store para
 * conservar pestana y filtros, y para el contador de pendientes del menu.
 */
export const useReviewsStore = defineStore('reviews', () => {
  const api = useReviewsApi()
  const tab = ref<ModerationTab>('pending')

  const pending = reactive(createPagedList(query => api.pending(query), {}, 20))
  const all = reactive(createPagedList(
    ({ sort, ...query }) => api.list({ ...query, sort: REVIEW_SORTS[sort].value }),
    emptyReviewFilters(),
    20,
  ))

  const pendingCount = computed(() => pending.data?.totalElements ?? null)

  /** Tras aprobar o borrar se recarga la pagina actual de ambas listas. */
  function refresh() {
    void pending.load()
    if (all.data) void all.load()
  }

  async function approve(reviewId: string) {
    const review = await api.approve(reviewId)
    refresh()
    return review
  }

  async function remove(reviewId: string) {
    await api.remove(reviewId)
    refresh()
  }

  /** Aprobar varias: cada una es su propia llamada; se informa cuantas fallaron. */
  async function approveMany(reviewIds: string[]) {
    const results = await Promise.allSettled(reviewIds.map(id => api.approve(id)))
    refresh()
    return results.filter(r => r.status === 'rejected').length
  }

  return { tab, pending, all, pendingCount, approve, approveMany, remove }
})
