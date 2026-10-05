<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{ invalid?: boolean }>()

const model = defineModel<string>({ required: true })
const visible = ref(false)
</script>

<template>
  <div class="relative">
    <input
      v-model="model"
      v-bind="$attrs"
      :type="visible ? 'text' : 'password'"
      :aria-invalid="invalid || undefined"
      class="h-11 w-full rounded-xl border bg-surface-raised pl-3.5 pr-11 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-accent focus:ring-3 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
      :class="invalid ? 'border-danger' : 'border-line'"
    >
    <div class="absolute inset-y-0 right-0 flex items-center pr-1.5">
      <button
        type="button"
        class="grid size-9 place-items-center rounded-lg text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
        :aria-label="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        :aria-pressed="visible"
        @click="visible = !visible"
      >
        <Icon
          :name="visible ? 'ph:eye-slash' : 'ph:eye'"
          class="size-5"
          aria-hidden="true"
        />
      </button>
    </div>
  </div>
</template>
