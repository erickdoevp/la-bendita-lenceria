<script setup lang="ts">
import { regimenLabel } from '../constants'
import type { FiscalProfile } from '../types'

const props = defineProps<{
  profile: FiscalProfile
  busy?: 'default' | 'delete' | null
}>()
const emit = defineEmits<{ edit: [], setDefault: [], remove: [] }>()

const confirming = ref(false)

watch(() => props.busy, (value, previous) => {
  if (previous === 'delete' && !value) confirming.value = false
})
</script>

<template>
  <article
    class="flex h-full flex-col gap-4 rounded-lg border bg-default p-5"
    :class="profile.isDefault ? 'border-primary/50' : 'border-default'"
  >
    <header class="flex items-start justify-between gap-3">
      <h3 class="font-mono text-base font-medium tracking-wide text-highlighted">
        {{ profile.rfc }}
      </h3>
      <span
        v-if="profile.isDefault"
        class="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
      >
        <UIcon
          name="ph:star-fill"
          class="size-3.5"
          aria-hidden="true"
        />
        Predeterminado
      </span>
    </header>

    <dl class="grid flex-1 gap-2 text-sm">
      <div class="grid gap-0.5">
        <dt class="sr-only">
          Razón social
        </dt>
        <dd class="font-medium text-highlighted">
          {{ profile.razonSocial }}
        </dd>
      </div>
      <div class="grid gap-0.5">
        <dt class="text-xs text-muted">
          Régimen
        </dt>
        <dd class="text-muted">
          {{ regimenLabel(profile.regimenFiscal) }}
        </dd>
      </div>
      <div class="grid gap-0.5">
        <dt class="text-xs text-muted">
          C.P. fiscal
        </dt>
        <dd class="tabular-nums text-muted">
          {{ profile.cp }}
        </dd>
      </div>
    </dl>

    <footer class="flex flex-wrap items-center gap-1.5 border-t border-default pt-3">
      <template v-if="confirming">
        <span class="mr-auto text-xs text-muted">¿Eliminar este RFC?</span>
        <UButton
          color="error"
          variant="soft"
          size="sm"
          :loading="busy === 'delete'"
          label="Sí, eliminar"
          @click="emit('remove')"
        />
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          :disabled="busy === 'delete'"
          label="No"
          @click="confirming = false"
        />
      </template>
      <template v-else>
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          icon="ph:pencil-simple"
          :disabled="Boolean(busy)"
          label="Editar"
          @click="emit('edit')"
        />
        <UButton
          v-if="!profile.isDefault"
          color="neutral"
          variant="ghost"
          size="sm"
          :loading="busy === 'default'"
          :disabled="Boolean(busy)"
          label="Hacer predeterminado"
          @click="emit('setDefault')"
        />
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="ph:trash"
          class="ml-auto"
          :aria-label="`Eliminar ${profile.rfc}`"
          :disabled="Boolean(busy)"
          @click="confirming = true"
        />
      </template>
    </footer>
  </article>
</template>
