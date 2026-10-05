<script setup lang="ts">
import type { Address } from '../types'

const props = defineProps<{
  address: Address
  busy?: 'default' | 'delete' | null
}>()
const emit = defineEmits<{ edit: [], setDefault: [], remove: [] }>()

const confirming = ref(false)

const lines = computed(() => {
  const a = props.address
  const number = a.interiorNumber ? `${a.exteriorNumber} int. ${a.interiorNumber}` : a.exteriorNumber
  return [`${a.street} ${number}`, `Col. ${a.colonia}, C.P. ${a.cp}`, `${a.municipio}, ${a.estado}`]
})

watch(() => props.busy, (value, previous) => {
  if (previous === 'delete' && !value) confirming.value = false
})
</script>

<template>
  <article
    class="flex h-full flex-col gap-4 rounded-lg border bg-default p-5"
    :class="address.isDefault ? 'border-primary/50' : 'border-default'"
  >
    <header class="flex items-start justify-between gap-3">
      <h3 class="truncate font-medium text-highlighted">
        {{ address.alias }}
      </h3>
      <span
        v-if="address.isDefault"
        class="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
      >
        <UIcon
          name="ph:star-fill"
          class="size-3.5"
          aria-hidden="true"
        />
        Predeterminada
      </span>
    </header>

    <address class="grid flex-1 gap-0.5 text-sm not-italic leading-relaxed text-muted">
      <span class="font-medium text-highlighted">{{ address.recipientName }}</span>
      <span
        v-for="line in lines"
        :key="line"
      >{{ line }}</span>
      <span class="mt-1">Tel. {{ address.phone }}</span>
    </address>

    <footer class="flex flex-wrap items-center gap-1.5 border-t border-default pt-3">
      <template v-if="confirming">
        <span class="mr-auto text-xs text-muted">¿Eliminar esta dirección?</span>
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
          v-if="!address.isDefault"
          color="neutral"
          variant="ghost"
          size="sm"
          :loading="busy === 'default'"
          :disabled="Boolean(busy)"
          label="Hacer predeterminada"
          @click="emit('setDefault')"
        />
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="ph:trash"
          class="ml-auto"
          :aria-label="`Eliminar ${address.alias}`"
          :disabled="Boolean(busy)"
          @click="confirming = true"
        />
      </template>
    </footer>
  </article>
</template>
