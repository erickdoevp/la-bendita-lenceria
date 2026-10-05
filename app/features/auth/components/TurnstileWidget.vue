<script setup lang="ts">
import { loadTurnstile } from '../utils/turnstile'

const props = defineProps<{ siteKey: string }>()
const emit = defineEmits<{
  verify: [token: string]
  expire: []
  error: []
}>()

const container = ref<HTMLElement | null>(null)
const loadFailed = ref(false)
let widgetId: string | undefined

onMounted(async () => {
  try {
    const turnstile = await loadTurnstile()
    if (!container.value) return
    widgetId = turnstile.render(container.value, {
      'sitekey': props.siteKey,
      'theme': 'auto',
      'language': 'es',
      'callback': token => emit('verify', token),
      'expired-callback': () => emit('expire'),
      'error-callback': () => emit('error'),
    })
  }
  catch {
    loadFailed.value = true
    emit('error')
  }
})

onBeforeUnmount(() => {
  if (widgetId) window.turnstile?.remove(widgetId)
})

defineExpose({
  reset: () => {
    if (widgetId) window.turnstile?.reset(widgetId)
  },
})
</script>

<template>
  <div>
    <div
      ref="container"
      class="min-h-[65px]"
    />
    <p
      v-if="loadFailed"
      class="text-sm text-danger"
    >
      No se pudo cargar la verificación. Recarga la página.
    </p>
  </div>
</template>
