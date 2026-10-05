/** Cuenta regresiva hasta `deadline` (ms). Llama `onExpire` una sola vez al llegar a cero. */
export function usePaymentCountdown(deadline: () => number | null, onExpire: () => void) {
  const now = ref(Date.now())
  let timer: ReturnType<typeof setInterval> | undefined
  let fired = false

  const remainingMs = computed(() => {
    const end = deadline()
    return end === null ? null : Math.max(0, end - now.value)
  })

  const label = computed(() => {
    if (remainingMs.value === null) return null
    const total = Math.ceil(remainingMs.value / 1000)
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
  })

  /** Ultimos 3 minutos: se resalta para que no se le pase. */
  const urgent = computed(() => remainingMs.value !== null && remainingMs.value < 3 * 60_000)

  watch(deadline, (end) => {
    clearInterval(timer)
    fired = false
    if (end === null) return
    now.value = Date.now()
    timer = setInterval(() => {
      now.value = Date.now()
      if (!fired && remainingMs.value === 0) {
        fired = true
        clearInterval(timer)
        onExpire()
      }
    }, 1000)
  }, { immediate: true })

  onBeforeUnmount(() => clearInterval(timer))

  return { remainingMs, label, urgent }
}
