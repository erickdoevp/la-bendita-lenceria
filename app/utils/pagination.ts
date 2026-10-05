export interface Page<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/** Spring puede serializar Page<T> plano o con un objeto "page" (VIA_DTO). */
export interface RawPage<T> {
  content: T[]
  number?: number
  size?: number
  totalElements?: number
  totalPages?: number
  page?: { number: number, size: number, totalElements: number, totalPages: number }
}

export function toPage<T>(raw: RawPage<T>): Page<T> {
  const meta = raw.page ?? raw
  return {
    items: raw.content ?? [],
    page: meta.number ?? 0,
    size: meta.size ?? raw.content?.length ?? 0,
    totalElements: meta.totalElements ?? raw.content?.length ?? 0,
    totalPages: meta.totalPages ?? 1,
  }
}
