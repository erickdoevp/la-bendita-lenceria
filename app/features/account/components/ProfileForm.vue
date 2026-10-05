<script setup lang="ts">
import { CustomerAvatar, useCustomerAuthStore } from '~/features/customer-auth'
import { profileSchema } from '../schemas'
import { useProfileApi } from '../services'

const auth = useCustomerAuthStore()
const api = useProfileApi()
const { fieldErrors, formError, validate, applyApiError, clearField } = useFormErrors()

const values = reactive({ name: '', firstLastName: '', secondLastName: '', phoneNumber: '' })
const avatar = ref<File | null>(null)
const avatarError = ref<string | null>(null)
const avatarPreview = useObjectUrl(avatar)
const fileInput = ref<HTMLInputElement | null>(null)
const pending = ref(false)
const saved = ref(false)

function fill() {
  const user = auth.user
  values.name = user?.name ?? ''
  values.firstLastName = user?.firstLastName ?? ''
  values.secondLastName = user?.secondLastName ?? ''
  values.phoneNumber = user?.phoneNumber ?? ''
}

watch(() => auth.user, fill, { immediate: true })
for (const key of Object.keys(values) as (keyof typeof values)[]) {
  watch(() => values[key], () => {
    clearField(key)
    saved.value = false
  })
}

const previewUser = computed(() => ({
  name: values.name,
  firstLastName: values.firstLastName,
  avatarImgUrl: avatarPreview.value ?? auth.user?.avatarImgUrl ?? null,
}))

function onPickAvatar(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const result = imageFileSchema.safeParse(file)
  avatarError.value = result.success ? null : (result.error.issues[0]?.message ?? 'Archivo no válido.')
  if (result.success) {
    avatar.value = file
    saved.value = false
  }
}

async function onSubmit() {
  const payload = validate(profileSchema, values)
  if (!payload) return

  pending.value = true
  try {
    auth.setUser(await api.update(payload, avatar.value))
    avatar.value = null
    saved.value = true
  }
  catch (error) {
    applyApiError(error)
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <form
    class="grid gap-6"
    novalidate
    @submit.prevent="onSubmit"
  >
    <UAlert
      v-if="formError"
      color="error"
      icon="ph:warning-circle"
      :title="formError"
    />

    <div class="flex items-center gap-5">
      <CustomerAvatar
        :user="previewUser"
        size="lg"
      />
      <div class="grid justify-items-start gap-1.5">
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          icon="ph:camera"
          :label="previewUser.avatarImgUrl ? 'Cambiar foto' : 'Subir foto'"
          @click="fileInput?.click()"
        />
        <input
          ref="fileInput"
          type="file"
          class="sr-only"
          tabindex="-1"
          aria-label="Foto de perfil"
          :accept="IMAGE_ACCEPT"
          @change="onPickAvatar"
        >
        <p
          class="text-sm"
          :class="avatarError ? 'text-error' : 'text-muted'"
        >
          {{ avatarError ?? (avatar ? 'Se guardará al pulsar «Guardar cambios».' : 'JPG, PNG, WebP o AVIF. Máximo 10 MB.') }}
        </p>
      </div>
    </div>

    <div class="grid gap-5 sm:grid-cols-2 sm:gap-4">
      <UFormField
        label="Nombre"
        :error="fieldErrors.name"
        class="sm:col-span-2"
      >
        <UInput
          v-model="values.name"
          autocomplete="given-name"
        />
      </UFormField>
      <UFormField
        label="Primer apellido"
        :error="fieldErrors.firstLastName"
      >
        <UInput
          v-model="values.firstLastName"
          autocomplete="family-name"
        />
      </UFormField>
      <UFormField
        label="Segundo apellido"
        :error="fieldErrors.secondLastName"
        hint="Opcional"
      >
        <UInput
          v-model="values.secondLastName"
        />
      </UFormField>
      <UFormField
        label="Teléfono"
        :error="fieldErrors.phoneNumber"
        hint="Opcional"
      >
        <UInput
          v-model="values.phoneNumber"
          type="tel"
          inputmode="tel"
          autocomplete="tel-national"
        />
      </UFormField>
    </div>

    <dl class="grid gap-4 rounded-lg bg-muted px-4 py-3 text-sm sm:grid-cols-2">
      <div class="grid min-w-0 gap-0.5">
        <dt class="text-muted">
          Correo
        </dt>
        <dd class="truncate text-highlighted">
          {{ auth.user?.email }}
        </dd>
      </div>
      <div class="grid min-w-0 gap-0.5">
        <dt class="text-muted">
          Usuario
        </dt>
        <dd class="truncate text-highlighted">
          {{ auth.user?.username }}
        </dd>
      </div>
      <p class="text-sm text-muted sm:col-span-2">
        El correo y el usuario no se pueden cambiar.
      </p>
    </dl>

    <div class="flex flex-wrap items-center gap-3">
      <UButton
        type="submit"
        :loading="pending"
        label="Guardar cambios"
      />
      <p
        v-if="saved"
        role="status"
        class="flex items-center gap-1.5 text-sm text-success"
      >
        <UIcon
          name="ph:check-circle"
          class="size-4"
          aria-hidden="true"
        />
        Cambios guardados
      </p>
    </div>
  </form>
</template>
