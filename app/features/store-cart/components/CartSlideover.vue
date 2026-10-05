<script setup lang="ts">
import { useCartStore } from '../stores/cart.store'
import { piecesLabel } from '../utils/cart-summary'
import CartEmpty from './CartEmpty.vue'
import CartFreeShipping from './CartFreeShipping.vue'
import CartLineItem from './CartLineItem.vue'
import CartSummaryPanel from './CartSummaryPanel.vue'

const cart = useCartStore()
const dialog = ref<HTMLDialogElement | null>(null)
const route = useRoute()

// <dialog> modal: atrapa el foco y cierra con Escape sin codigo extra
watch(() => cart.isOpen, (value) => {
  if (value && !dialog.value?.open) dialog.value?.showModal()
  if (!value && dialog.value?.open) dialog.value.close()
}, { flush: 'post' })

watch(() => route.fullPath, () => cart.close())

function onClose() {
  cart.close()
  cart.clearUndo()
}

const hasLines = computed(() => cart.lines.length > 0)
const busy = computed(() => cart.lines.some(line => cart.isPending(line.id)))
</script>

<template>
  <dialog
    ref="dialog"
    aria-labelledby="cart-title"
    class="m-0 ml-auto h-[100dvh] max-h-none w-full max-w-md border-l border-line bg-surface-raised p-0 text-ink backdrop:bg-ink/30 open:motion-safe:animate-[drawer-right-in_260ms_cubic-bezier(0.16,1,0.3,1)]"
    @close="onClose"
    @click="($event.target === dialog) && cart.close()"
  >
    <!-- El contenido se monta al abrir para que la entrada en cascada se repita -->
    <div
      v-if="cart.isOpen"
      class="flex h-full flex-col"
    >
      <header class="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line px-5">
        <h2
          id="cart-title"
          class="flex items-baseline gap-2 text-lg font-semibold tracking-tight"
        >
          Tu bolsa
          <span
            v-if="cart.count"
            class="text-sm font-normal tabular-nums text-ink-muted"
          >{{ piecesLabel(cart.count) }}</span>
        </h2>
        <button
          type="button"
          class="-mr-2 grid size-10 place-items-center rounded-xl transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Cerrar bolsa"
          @click="cart.close()"
        >
          <Icon
            name="ph:x-bold"
            class="size-5"
            aria-hidden="true"
          />
        </button>
      </header>

      <div
        v-if="cart.status === 'loading' && !cart.cart"
        class="grid content-start gap-6 px-5 py-6"
        aria-busy="true"
        aria-label="Cargando tu bolsa"
      >
        <div
          v-for="n in 3"
          :key="n"
          class="flex gap-4"
        >
          <UiSkeleton class="aspect-[3/4] w-20 rounded-lg sm:w-24" />
          <div class="grid flex-1 content-start gap-2 pt-1">
            <UiSkeleton class="h-4 w-3/4" />
            <UiSkeleton class="h-3 w-1/3" />
            <UiSkeleton class="mt-6 h-9 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      <div
        v-else-if="cart.status === 'error' && !cart.cart"
        class="grid content-start gap-4 px-5 py-6"
      >
        <UiAlert>{{ cart.loadError }}</UiAlert>
        <UiButton
          variant="secondary"
          icon="ph:arrow-clockwise-bold"
          class="justify-self-start"
          @click="cart.reload()"
        >
          Reintentar
        </UiButton>
      </div>

      <template v-else>
        <div
          v-if="hasLines"
          class="shrink-0 border-b border-line px-5 py-4"
        >
          <CartFreeShipping
            :remaining="cart.summary.remainingForFreeShipping"
            :progress="cart.summary.freeShippingProgress"
          />
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div
            aria-live="polite"
            class="empty:hidden"
          >
            <div
              v-if="cart.lastRemoved"
              class="mx-5 mt-4 flex items-center justify-between gap-3 rounded-lg bg-surface px-3.5 py-2.5 text-[13px] text-ink"
            >
              <span class="min-w-0 truncate">Quitaste {{ cart.lastRemoved.line.name }}.</span>
              <button
                type="button"
                class="shrink-0 font-medium text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
                @click="cart.undoRemove()"
              >
                Deshacer
              </button>
            </div>
          </div>

          <TransitionGroup
            v-if="hasLines"
            tag="ul"
            name="cart-line"
            class="relative"
            aria-label="Piezas en tu bolsa"
          >
            <li
              v-for="(line, index) in cart.lines"
              :key="line.id"
              class="cart-line border-b border-line px-5 py-5 last:border-b-0"
              :style="{ '--i': index }"
            >
              <CartLineItem
                :line="line"
                :pending="cart.isPending(line.id)"
                :error="cart.lineErrors[line.id] ?? null"
                @quantity="cart.setQuantity(line.id, $event)"
                @remove="cart.remove(line.id)"
                @navigate="cart.close()"
              />
            </li>
          </TransitionGroup>

          <CartEmpty
            v-else
            @close="cart.close()"
          />
        </div>

        <footer
          v-if="hasLines"
          class="shrink-0 border-t border-line bg-surface-raised px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4"
        >
          <CartSummaryPanel
            :summary="cart.summary"
            :busy="busy"
            @checkout="cart.close()"
          />
        </footer>
      </template>
    </div>
  </dialog>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .cart-line {
    animation: rise-in 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
    animation-delay: calc(var(--i, 0) * 60ms + 80ms);
  }

  .cart-line-move {
    transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* La linea que sale se saca del flujo para que las demas suban con -move */
  .cart-line-leave-active {
    position: absolute;
    inset-inline: 0;
    transition: opacity 180ms ease-out, transform 180ms ease-out;
  }

  .cart-line-leave-to {
    opacity: 0;
    transform: translateX(24px);
  }
}
</style>
