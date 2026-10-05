<script setup lang="ts">
import { newsletterSchema } from '../schemas'
import { useHomeApi } from '../services'

const api = useHomeApi()
const email = ref('')
const error = ref<string | null>(null)
const pending = ref(false)
const done = ref(false)

async function submit() {
  const parsed = newsletterSchema.safeParse({ email: email.value })
  if (!parsed.success) {
    error.value = parsed.error.issues[0]?.message ?? 'Revisa tu correo.'
    return
  }
  error.value = null
  pending.value = true
  try {
    await api.subscribe(parsed.data)
    done.value = true
  }
  catch (e) {
    error.value = parseApiError(e).message
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <section
    aria-labelledby="home-newsletter-title"
    class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-10 lg:pb-24"
  >
    <div class="reveal grid gap-8 rounded-2xl bg-accent/[0.07] px-6 py-10 ring-1 ring-accent/15 md:grid-cols-2 md:items-end md:gap-12 md:px-12 md:py-14">
      <div class="grid gap-3">
        <h2
          id="home-newsletter-title"
          class="max-w-[20ch] text-3xl font-semibold tracking-tight text-ink md:text-4xl"
        >
          Entérate primero de lo nuevo
        </h2>
        <p class="max-w-[44ch] leading-relaxed text-ink-muted">
          Un correo al mes con lanzamientos y rebajas. Nada más.
        </p>
      </div>

      <div
        v-if="done"
        role="status"
        class="flex items-start gap-3 rounded-xl bg-surface-raised px-5 py-4 ring-1 ring-line"
      >
        <Icon
          name="ph:check-circle"
          class="mt-0.5 size-5 shrink-0 text-success"
          aria-hidden="true"
        />
        <p class="text-sm leading-relaxed text-ink">
          Listo. Te enviamos un correo a <strong class="font-medium">{{ email }}</strong> para confirmar tu suscripción.
        </p>
      </div>

      <form
        v-else
        novalidate
        class="grid gap-3"
        @submit.prevent="submit"
      >
        <UiField
          id="newsletter-email"
          label="Correo electrónico"
          hint="Puedes darte de baja cuando quieras."
          :error="error ?? undefined"
        >
          <template #default="{ id, describedBy, invalid }">
            <div class="flex flex-col gap-3 sm:flex-row">
              <div class="min-w-0 flex-1">
                <UiInput
                  :id="id"
                  v-model="email"
                  type="email"
                  name="email"
                  autocomplete="email"
                  inputmode="email"
                  placeholder="tu@correo.com"
                  :invalid="invalid"
                  :aria-describedby="describedBy"
                />
              </div>
              <UiButton
                type="submit"
                :loading="pending"
              >
                Suscribirme
              </UiButton>
            </div>
          </template>
        </UiField>
      </form>
    </div>
  </section>
</template>
