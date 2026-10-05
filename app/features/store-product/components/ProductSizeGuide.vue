<script setup lang="ts">
const props = defineProps<{ system: 'brasier' | 'letra' }>()
const open = defineModel<boolean>('open', { required: true })
const dialog = ref<HTMLDialogElement | null>(null)

watch(open, (value) => {
  if (value && !dialog.value?.open) dialog.value?.showModal()
  if (!value && dialog.value?.open) dialog.value.close()
}, { flush: 'post' })

// TODO: valores de referencia; reemplazar por la tabla oficial de la marca (centimetros)
const BRA_ROWS = [
  { size: '32', underbust: '68 a 72' },
  { size: '34', underbust: '73 a 77' },
  { size: '36', underbust: '78 a 82' },
  { size: '38', underbust: '83 a 87' },
]
const CUP_ROWS = [
  { cup: 'A', difference: '12 a 13' },
  { cup: 'B', difference: '14 a 15' },
  { cup: 'C', difference: '16 a 17' },
  { cup: 'D', difference: '18 a 19' },
]
const LETTER_ROWS = [
  { size: 'XS', bust: '78 a 82', waist: '60 a 64', hip: '86 a 90' },
  { size: 'S', bust: '83 a 87', waist: '65 a 69', hip: '91 a 95' },
  { size: 'M', bust: '88 a 92', waist: '70 a 74', hip: '96 a 100' },
  { size: 'L', bust: '93 a 98', waist: '75 a 80', hip: '101 a 106' },
  { size: 'XL', bust: '99 a 104', waist: '81 a 86', hip: '107 a 112' },
  { size: 'XXL', bust: '105 a 110', waist: '87 a 92', hip: '113 a 118' },
]

const isBra = computed(() => props.system === 'brasier')
const th = 'px-3 py-2.5 text-left text-[13px] font-medium text-ink-muted'
const td = 'px-3 py-2.5 tabular-nums text-ink'
</script>

<template>
  <dialog
    ref="dialog"
    aria-labelledby="size-guide-title"
    class="m-0 ml-auto h-[100dvh] max-h-none w-full max-w-md bg-surface p-0 text-ink backdrop:bg-ink/40 open:motion-safe:animate-[drawer-right-in_220ms_ease-out]"
    @close="open = false"
    @click="($event.target === dialog) && (open = false)"
  >
    <div class="flex h-full flex-col">
      <div class="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
        <h2
          id="size-guide-title"
          class="text-lg font-semibold tracking-tight"
        >
          Guía de tallas
        </h2>
        <button
          type="button"
          class="grid size-10 place-items-center rounded-xl transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Cerrar guía de tallas"
          @click="open = false"
        >
          <Icon
            name="ph:x"
            class="size-5"
            aria-hidden="true"
          />
        </button>
      </div>

      <div class="grid flex-1 content-start gap-8 overflow-y-auto px-5 py-6">
        <template v-if="isBra">
          <section class="grid gap-3">
            <h3 class="font-medium text-ink">
              1. Contorno
            </h3>
            <p class="text-sm leading-relaxed text-ink-muted">
              Mide justo debajo del busto, con la cinta firme y paralela al piso.
            </p>
            <table class="w-full overflow-hidden rounded-xl bg-surface-raised text-sm ring-1 ring-line">
              <thead class="border-b border-line">
                <tr>
                  <th :class="th">
                    Contorno
                  </th>
                  <th :class="th">
                    Bajo busto (cm)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in BRA_ROWS"
                  :key="row.size"
                >
                  <td :class="td">
                    {{ row.size }}
                  </td>
                  <td :class="td">
                    {{ row.underbust }}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
          <section class="grid gap-3">
            <h3 class="font-medium text-ink">
              2. Copa
            </h3>
            <p class="text-sm leading-relaxed text-ink-muted">
              Mide la parte más alta del busto y réstale la medida del contorno.
            </p>
            <table class="w-full overflow-hidden rounded-xl bg-surface-raised text-sm ring-1 ring-line">
              <thead class="border-b border-line">
                <tr>
                  <th :class="th">
                    Copa
                  </th>
                  <th :class="th">
                    Diferencia (cm)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in CUP_ROWS"
                  :key="row.cup"
                >
                  <td :class="td">
                    {{ row.cup }}
                  </td>
                  <td :class="td">
                    {{ row.difference }}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
          <p class="text-sm leading-relaxed text-ink-muted">
            Ejemplo: si tu contorno es 75 cm y la diferencia es 15 cm, tu talla es 34B.
          </p>
        </template>

        <section
          v-else
          class="grid gap-3"
        >
          <p class="text-sm leading-relaxed text-ink-muted">
            Mide sobre la piel o con ropa ligera. Si quedas entre dos tallas, elige la mayor.
          </p>
          <table class="w-full overflow-hidden rounded-xl bg-surface-raised text-sm ring-1 ring-line">
            <thead class="border-b border-line">
              <tr>
                <th :class="th">
                  Talla
                </th>
                <th :class="th">
                  Busto
                </th>
                <th :class="th">
                  Cintura
                </th>
                <th :class="th">
                  Cadera
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in LETTER_ROWS"
                :key="row.size"
              >
                <td
                  :class="td"
                  class="font-medium"
                >
                  {{ row.size }}
                </td>
                <td :class="td">
                  {{ row.bust }}
                </td>
                <td :class="td">
                  {{ row.waist }}
                </td>
                <td :class="td">
                  {{ row.hip }}
                </td>
              </tr>
            </tbody>
          </table>
          <p class="text-[13px] text-ink-muted">
            Medidas en centímetros.
          </p>
        </section>
      </div>
    </div>
  </dialog>
</template>
