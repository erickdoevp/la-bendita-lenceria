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
      <UCard
        title="Código"
        description="Lo que escribe la clienta en el carrito. No distingue mayúsculas."
      >
        <div class="grid gap-5">
          <UFormField
            label="Código"
            :help="isEdit && coupon?.usedCount ? 'Cambiarlo no afecta los usos ya registrados.' : 'Letras, números, guion y guion bajo.'"
            :error="fieldErrors.code"
          >
            <UInput
              v-model="values.code"
              :ui="{ base: 'font-mono uppercase tracking-wide' }"
              maxlength="40"
              placeholder="BIENVENIDA10"
              autocomplete="off"
              spellcheck="false"
            />
          </UFormField>

          <UFormField
            label="Descripción"
            help="La ve la clienta al aplicar el cupón."
            :hint="coupon?.description ? undefined : 'Opcional'"
            :error="fieldErrors.description"
          >
            <UInput
              v-model="values.description"
              maxlength="255"
              placeholder="10 % en tu primera compra"
              autocomplete="off"
            />
          </UFormField>
        </div>
      </UCard>

      <UCard
        title="Descuento"
        description="Se aplica sobre el subtotal de productos (con IVA), antes del envío."
      >
        <div class="grid gap-5">
          <URadioGroup
            v-model="values.valueType"
            legend="Tipo"
            :items="valueTypes"
            variant="card"
            orientation="horizontal"
            :ui="{ fieldset: 'grid grid-cols-2 gap-2', legend: 'mb-2' }"
          >
            <template #label="{ item }">
              <span class="inline-flex items-center gap-2">
                <UIcon
                  :name="item.icon"
                  class="size-4"
                />
                {{ item.label }}
              </span>
            </template>
          </URadioGroup>

          <div class="grid gap-5 sm:grid-cols-2">
            <UFormField
              :label="values.valueType === 'PERCENTAGE' ? 'Porcentaje' : 'Monto'"
              :help="values.valueType === 'PERCENTAGE' ? 'Entre 0.01 y 100.' : 'Nunca descuenta más que el subtotal.'"
              :error="fieldErrors.value"
            >
              <UInput
                v-model.number="values.value"
                type="number"
                inputmode="decimal"
                min="0.01"
                :max="values.valueType === 'PERCENTAGE' ? 100 : undefined"
                step="0.01"
                :placeholder="values.valueType === 'PERCENTAGE' ? '10' : '150'"
              >
                <template
                  v-if="values.valueType === 'FIXED'"
                  #leading
                >
                  <span class="text-muted">$</span>
                </template>
                <template
                  v-else
                  #trailing
                >
                  <span class="text-muted">%</span>
                </template>
              </UInput>
            </UFormField>

            <UFormField
              v-if="values.valueType === 'PERCENTAGE'"
              label="Tope de descuento"
              help="Máximo en pesos. Vacío = sin tope."
              :hint="coupon?.maxDiscountAmount == null ? 'Opcional' : undefined"
              :error="fieldErrors.maxDiscountAmount"
            >
              <UInput
                v-model.number="values.maxDiscountAmount"
                type="number"
                inputmode="decimal"
                min="0"
                step="0.01"
                placeholder="200"
              >
                <template #leading>
                  <span class="text-muted">$</span>
                </template>
              </UInput>
            </UFormField>
          </div>
        </div>
      </UCard>

      <UCard
        title="Restricciones"
        description="Todas opcionales. Cada clienta puede usar el cupón una sola vez y solo con cuenta."
      >
        <div class="grid gap-5">
          <div class="grid gap-5 sm:grid-cols-2">
            <UFormField
              label="Compra mínima"
              help="Subtotal desde el que aplica."
              :hint="coupon?.minOrderAmount == null ? 'Opcional' : undefined"
              :error="fieldErrors.minOrderAmount"
            >
              <UInput
                v-model.number="values.minOrderAmount"
                type="number"
                inputmode="decimal"
                min="0"
                step="0.01"
                placeholder="500"
              >
                <template #leading>
                  <span class="text-muted">$</span>
                </template>
              </UInput>
            </UFormField>

            <UFormField
              label="Usos totales"
              :help="coupon?.usedCount ? `Ya lleva ${coupon.usedCount}. Vacío = ilimitado.` : 'Entre todas las clientas. Vacío = ilimitado.'"
              :hint="coupon?.maxUses == null ? 'Opcional' : undefined"
              :error="fieldErrors.maxUses"
            >
              <UInput
                v-model.number="values.maxUses"
                type="number"
                inputmode="numeric"
                min="1"
                step="1"
                placeholder="100"
              />
            </UFormField>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <UFormField
              label="Vence el"
              help="Vacío = no vence. Sin hora, vale todo el día."
              :hint="coupon?.expiresAt ? undefined : 'Opcional'"
              :error="fieldErrors.expiresDate"
            >
              <UInput
                v-model="values.expiresDate"
                type="date"
                :min="today"
              />
            </UFormField>

            <UFormField
              label="Hora"
              hint="Opcional"
            >
              <UInput
                v-model="values.expiresTime"
                type="time"
                :disabled="!values.expiresDate"
              />
            </UFormField>
          </div>

          <USwitch
            v-model="values.firstPurchaseOnly"
            label="Solo primera compra"
            description="Solo si la clienta no tiene pedidos previos (los cancelados no cuentan)."
          />
        </div>
      </UCard>
    </div>

    <div class="grid gap-6 lg:sticky lg:top-6">
      <UCard title="Resumen">
        <div class="grid gap-5">
          <p class="font-mono text-lg font-semibold tracking-wide text-highlighted">
            {{ values.code || 'CÓDIGO' }}
          </p>
          <p
            class="text-sm leading-relaxed text-muted"
            aria-live="polite"
          >
            {{ preview }}
          </p>

          <USwitch
            v-model="values.active"
            label="Activo"
            description="Apagado, nadie lo puede usar."
          />

          <!-- El formulario es largo: el aviso junto al boton dice que hay errores mas arriba -->
          <UAlert
            v-if="formError || Object.keys(fieldErrors).length"
            color="error"
            icon="ph:warning-circle"
            :title="formError ?? 'Revisa los campos marcados.'"
          />

          <div class="grid gap-2">
            <UButton
              type="submit"
              block
              :loading="pending"
              :icon="isEdit ? 'ph:floppy-disk' : 'ph:plus'"
              :label="isEdit ? 'Guardar cambios' : 'Crear cupón'"
            />
            <UButton
              color="neutral"
              variant="outline"
              block
              label="Cancelar"
              :disabled="pending"
              @click="emit('cancel')"
            />
          </div>
        </div>
      </UCard>
    </div>
  </form>
</template>
