<script setup lang="ts">
import { CREATE_STATUS_OPTIONS } from '../constants'
import { useProductDraftStore } from '../stores/product-draft.store'

const draft = useProductDraftStore()
</script>

<template>
  <UiPanel title="Publicación">
    <fieldset>
      <legend class="sr-only">
        Estado del artículo
      </legend>
      <div class="grid gap-3 sm:grid-cols-2">
        <label
          v-for="option in CREATE_STATUS_OPTIONS"
          :key="option.value"
          class="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors duration-200 focus-within:ring-3 focus-within:ring-accent/20"
          :class="draft.form.status === option.value ? 'border-accent bg-accent/5' : 'border-line hover:border-ink-muted'"
        >
          <input
            v-model="draft.form.status"
            type="radio"
            name="product-status"
            :value="option.value"
            class="mt-0.5 size-4 accent-[var(--accent)]"
          >
          <span class="grid gap-0.5">
            <span class="text-sm font-medium text-ink">{{ option.label }}</span>
            <span class="text-[13px] text-ink-muted">{{ option.description }}</span>
          </span>
        </label>
      </div>
    </fieldset>
  </UiPanel>
</template>
