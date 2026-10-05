import type { MaybeRefOrGetter } from 'vue'

/** URL de vista previa para un File; se revoca al cambiar o desmontar. */
export function useObjectUrl(file: MaybeRefOrGetter<File | null | undefined>) {
  const url = ref<string | null>(null)

  watch(() => toValue(file), (next) => {
    if (url.value) URL.revokeObjectURL(url.value)
    url.value = next ? URL.createObjectURL(next) : null
  }, { immediate: true })

  onScopeDispose(() => {
    if (url.value) URL.revokeObjectURL(url.value)
  })

  return url
}
