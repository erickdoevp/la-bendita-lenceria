<script setup lang="ts">
import { couponSchema } from '../schemas'
import { useCouponsApi } from '../services'
import { useCouponsStore } from '../stores/coupons.store'
import type { Coupon, CouponValueType } from '../types'
import { describeCoupon, joinExpiresAt, toFormValues } from '../utils/coupon'

const props = defineProps<{ coupon?: Coupon | null }>()
const emit = defineEmits<{ saved: [coupon: Coupon], cancel: [] }>()

const api = useCouponsApi()
const store = useCouponsStore()
const { fieldErrors, formError, validate, applyApiError, clearField, reset } = useFormErrors()
const values = reactive(toFormValues(props.coupon ?? null))
const pending = ref(false)
const uid = useId()
const isEdit = computed(() => Boolean(props.coupon))

const today = new Date().toLocaleDateString('en-CA')
const valueTypes: { value: CouponValueType, label: string, icon: string }[] = [
  { value: 'PERCENTAGE', label: 'Porcentaje', icon: 'ph:percent' },
  { value: 'FIXED', label: 'Monto fijo', icon: 'ph:currency-dollar' },
]

watch(() => props.coupon, (coupon) => {
  Object.assign(values, toFormValues(coupon ?? null))
  reset()
})

// Se guarda en MAYUSCULAS y sin espacios: se refleja mientras se escribe
watch(() => values.code, (code) => {
  const normalized = code.toUpperCase().replace(/\s+/g, '')
  if (normalized !== code) values.code = normalized
})

for (const field of Object.keys(values) as (keyof typeof values)[]) {
  watch(() => values[field], () => clearField(field))
}
watch(() => values.expiresTime, () => clearField('expiresDate'))

const optionalNumber = (value: number | string) => (value === '' ? null : toNumber(value))

const preview = computed(() => describeCoupon({
  valueType: values.valueType,
  value: optionalNumber(values.value),
  minOrderAmount: optionalNumber(values.minOrderAmount),
  maxDiscountAmount: values.valueType === 'PERCENTAGE' ? optionalNumber(values.maxDiscountAmount) : null,
  maxUses: optionalNumber(values.maxUses),
  usedCount: props.coupon?.usedCount ?? 0,
  firstPurchaseOnly: values.firstPurchaseOnly,
  expiresAt: joinExpiresAt(values.expiresDate, values.expiresTime),
}))

/** Algunos 400 llegan solo con "message": se pintan junto al campo que corresponde. */
function applyCouponError(error: unknown) {
  const info = applyApiError(error)
  const fields = { ...info.fieldErrors }
  if (fields.expiresAt) {
    fields.expiresDate = fields.expiresAt
    delete fields.expiresAt
  }
  if (!Object.keys(fields).length) {
    if (/código/i.test(info.message)) fields.code = info.message
    else if (/100\s?%/.test(info.message)) fields.value = info.message
    else if (/vencimiento/i.test(info.message)) fields.expiresDate = info.message
  }
  if (Object.keys(fields).length) {
    fieldErrors.value = fields
    formError.value = 'Revisa los campos marcados.'
  }
}

async function onSubmit() {
  const payload = validate(couponSchema(props.coupon ?? null), values)
  if (!payload) return

  pending.value = true
  try {
    const saved = props.coupon
      ? await api.update(props.coupon.id, payload)
      : await api.create(payload)
    store.upsert(saved)
    emit('saved', saved)
  }
  catch (error) {
    applyCouponError(error)
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <form
    class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
    novalidate
    @submit.prevent="onSubmit"
  >
    <div class="grid gap-6">
      <UiPanel
        title="Código"
        description="Lo que escribe la clienta en el carrito. No distingue mayúsculas."
      >
        <div class="grid gap-5">
          <UiField
            :id="`${uid}-code`"
            v-slot="field"
            label="Código"
            :hint="isEdit && coupon?.usedCount ? 'Cambiarlo no afecta los usos ya registrados.' : 'Letras, números, guion y guion bajo.'"
            :error="fieldErrors.code"
          >
            <UiInput
              :id="field.id"
              v-model="values.code"
              class="font-mono uppercase tracking-wide"
              maxlength="40"
              :invalid="field.invalid"
              :aria-describedby="field.describedBy"
              placeholder="BIENVENIDA10"
              autocomplete="off"
              spellcheck="false"
            />
          </UiField>

          <UiField
            :id="`${uid}-description`"
            v-slot="field"
            label="Descripción"
            hint="La ve la clienta al aplicar el cupón."
            :optional="!coupon?.description"
            :error="fieldErrors.description"
          >
            <UiInput
              :id="field.id"
              v-model="values.description"
              maxlength="255"
              :invalid="field.invalid"
              :aria-describedby="field.describedBy"
              placeholder="10 % en tu primera compra"
              autocomplete="off"
            />
          </UiField>
        </div>
      </UiPanel>

      <UiPanel
        title="Descuento"
        description="Se aplica sobre el subtotal de productos (con IVA), antes del envío."
      >
        <div class="grid gap-5">
          <fieldset class="grid gap-2">
            <legend class="pb-2 text-sm font-medium text-ink">
              Tipo
            </legend>
            <div
              class="grid grid-cols-2 gap-2"
              role="radiogroup"
            >
              <label
                v-for="type in valueTypes"
                :key="type.value"
                class="flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-colors focus-within:ring-3 focus-within:ring-accent/20"
                :class="values.valueType === type.value ? 'border-accent bg-accent/5 text-ink' : 'border-line text-ink-muted hover:border-ink-muted'"
              >
                <input
                  v-model="values.valueType"
                  type="radio"
                  :name="`${uid}-type`"
                  :value="type.value"
                  class="sr-only"
                >
                <Icon
                  :name="type.icon"
                  class="size-4"
                  :class="values.valueType === type.value && 'text-accent'"
                  aria-hidden="true"
                />
                {{ type.label }}
              </label>
            </div>
          </fieldset>

          <div class="grid gap-5 sm:grid-cols-2">
            <UiField
              :id="`${uid}-value`"
              v-slot="field"
              :label="values.valueType === 'PERCENTAGE' ? 'Porcentaje' : 'Monto'"
              :hint="values.valueType === 'PERCENTAGE' ? 'Entre 0.01 y 100.' : 'Nunca descuenta más que el subtotal.'"
              :error="fieldErrors.value"
            >
              <UiInput
                :id="field.id"
                v-model="values.value"
                type="number"
                inputmode="decimal"
                min="0.01"
                :max="values.valueType === 'PERCENTAGE' ? 100 : undefined"
                step="0.01"
                :prefix="values.valueType === 'FIXED' ? '$' : undefined"
                :suffix="values.valueType === 'PERCENTAGE' ? '%' : undefined"
                :invalid="field.invalid"
                :aria-describedby="field.describedBy"
                :placeholder="values.valueType === 'PERCENTAGE' ? '10' : '150'"
              />
            </UiField>

            <UiField
              v-if="values.valueType === 'PERCENTAGE'"
              :id="`${uid}-max-discount`"
              v-slot="field"
              label="Tope de descuento"
              hint="Máximo en pesos. Vacío = sin tope."
              :optional="coupon?.maxDiscountAmount == null"
              :error="fieldErrors.maxDiscountAmount"
            >
              <UiInput
                :id="field.id"
                v-model="values.maxDiscountAmount"
                type="number"
                inputmode="decimal"
                min="0"
                step="0.01"
                prefix="$"
                :invalid="field.invalid"
                :aria-describedby="field.describedBy"
                placeholder="200"
              />
            </UiField>
          </div>
        </div>
      </UiPanel>

      <UiPanel
        title="Restricciones"
        description="Todas opcionales. Cada clienta puede usar el cupón una sola vez y solo con cuenta."
      >
        <div class="grid gap-5">
          <div class="grid gap-5 sm:grid-cols-2">
            <UiField
              :id="`${uid}-min`"
              v-slot="field"
              label="Compra mínima"
              hint="Subtotal desde el que aplica."
              :optional="coupon?.minOrderAmount == null"
              :error="fieldErrors.minOrderAmount"
            >
              <UiInput
                :id="field.id"
                v-model="values.minOrderAmount"
                type="number"
                inputmode="decimal"
                min="0"
                step="0.01"
                prefix="$"
                :invalid="field.invalid"
                :aria-describedby="field.describedBy"
                placeholder="500"
              />
            </UiField>

            <UiField
              :id="`${uid}-max-uses`"
              v-slot="field"
              label="Usos totales"
              :hint="coupon?.usedCount ? `Ya lleva ${coupon.usedCount}. Vacío = ilimitado.` : 'Entre todas las clientas. Vacío = ilimitado.'"
              :optional="coupon?.maxUses == null"
              :error="fieldErrors.maxUses"
            >
              <UiInput
                :id="field.id"
                v-model="values.maxUses"
                type="number"
                inputmode="numeric"
                min="1"
                step="1"
                :invalid="field.invalid"
                :aria-describedby="field.describedBy"
                placeholder="100"
              />
            </UiField>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <UiField
              :id="`${uid}-expires`"
              v-slot="field"
              label="Vence el"
              hint="Vacío = no vence. Sin hora, vale todo el día."
              :optional="!coupon?.expiresAt"
              :error="fieldErrors.expiresDate"
            >
              <UiInput
                :id="field.id"
                v-model="values.expiresDate"
                type="date"
                :min="today"
                :invalid="field.invalid"
                :aria-describedby="field.describedBy"
              />
            </UiField>

            <UiField
              :id="`${uid}-expires-time`"
              v-slot="field"
              label="Hora"
              optional
            >
              <UiInput
                :id="field.id"
                v-model="values.expiresTime"
                type="time"
                :disabled="!values.expiresDate"
                :aria-describedby="field.describedBy"
              />
            </UiField>
          </div>

          <UiSwitch
            :id="`${uid}-first`"
            v-model="values.firstPurchaseOnly"
            label="Solo primera compra"
            description="Solo si la clienta no tiene pedidos previos (los cancelados no cuentan)."
          />
        </div>
      </UiPanel>
    </div>

    <div class="grid gap-6 lg:sticky lg:top-6">
      <UiPanel title="Resumen">
        <div class="grid gap-5">
          <p class="font-mono text-lg font-semibold tracking-wide text-ink">
            {{ values.code || 'CÓDIGO' }}
          </p>
          <p
            class="text-sm leading-relaxed text-ink-muted"
            aria-live="polite"
          >
            {{ preview }}
          </p>

          <UiSwitch
            :id="`${uid}-active`"
            v-model="values.active"
            label="Activo"
            description="Apagado, nadie lo puede usar."
          />

          <!-- El formulario es largo: el aviso junto al boton dice que hay errores mas arriba -->
          <UiAlert v-if="formError || Object.keys(fieldErrors).length">
            {{ formError ?? 'Revisa los campos marcados.' }}
          </UiAlert>

          <div class="grid gap-2">
            <UiButton
              type="submit"
              :loading="pending"
              :icon="isEdit ? 'ph:floppy-disk' : 'ph:plus'"
            >
              {{ isEdit ? 'Guardar cambios' : 'Crear cupón' }}
            </UiButton>
            <UiButton
              variant="secondary"
              :disabled="pending"
              @click="emit('cancel')"
            >
              Cancelar
            </UiButton>
          </div>
        </div>
      </UiPanel>
    </div>
  </form>
</template>
