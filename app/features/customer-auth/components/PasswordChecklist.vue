<script setup lang="ts">
import { PASSWORD_RULES } from '#shared/utils/password'

const props = defineProps<{ id: string, password: string }>()

const rules = computed(() => PASSWORD_RULES.map(rule => ({ label: rule.label, met: rule.test(props.password) })))
</script>

<template>
  <!-- Requisitos en vivo: el lector de pantalla los lee al enfocar el campo -->
  <ul
    :id="id"
    class="grid grid-cols-1 gap-x-4 gap-y-1 text-[13px] sm:grid-cols-2"
  >
    <li
      v-for="rule in rules"
      :key="rule.label"
      class="flex items-center gap-1.5 transition-colors duration-200"
      :class="rule.met ? 'text-success' : 'text-ink-muted'"
    >
      <Icon
        :name="rule.met ? 'ph:check-circle-fill' : 'ph:circle'"
        class="size-4 shrink-0"
        aria-hidden="true"
      />
      <span>
        <span class="first-letter:uppercase">{{ rule.label }}</span>
        <span class="sr-only">{{ rule.met ? '(cumplido)' : '(pendiente)' }}</span>
      </span>
    </li>
  </ul>
</template>
