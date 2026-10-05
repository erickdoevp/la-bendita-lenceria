<script setup lang="ts">
import { PasswordChangeForm, ProfileForm, SessionsPanel } from '~/features/account'

definePageMeta({
  layout: 'account',
  middleware: 'customer',
})

useSeoMeta({
  title: 'Perfil y seguridad | La Bendita Lencería',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="grid gap-6">
    <UiPageHeader
      title="Perfil y seguridad"
      description="Tus datos personales, tu contraseña y las sesiones abiertas."
    />
    <UiPanel title="Datos personales">
      <ProfileForm />
    </UiPanel>
    <UiPanel
      title="Contraseña"
      description="Mínimo 12 caracteres, con mayúscula, minúscula, número y carácter especial."
    >
      <PasswordChangeForm />
    </UiPanel>
    <UiPanel title="Sesiones">
      <SessionsPanel />
    </UiPanel>
  </div>
</template>
