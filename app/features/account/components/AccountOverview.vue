<script setup lang="ts">
import { CustomerAvatar, useCustomerAuthStore } from '~/features/customer-auth'
import { ACCOUNT_NAV } from '../constants'

const auth = useCustomerAuthStore()
const sections = ACCOUNT_NAV.filter(item => !item.exact)
</script>

<template>
  <div class="grid gap-8">
    <header
      v-if="auth.user"
      class="flex items-center gap-4"
    >
      <CustomerAvatar
        :user="auth.user"
        size="lg"
      />
      <div class="grid min-w-0 gap-1">
        <h1 class="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Hola, {{ auth.user.name }}
        </h1>
        <p class="truncate text-ink-muted">
          {{ auth.user.email }} · Con cuenta desde {{ formatDate(auth.user.createdAt.slice(0, 10)) }}
        </p>
      </div>
    </header>

    <ul class="grid gap-3 sm:grid-cols-2">
      <li
        v-for="section in sections"
        :key="section.to"
      >
        <NuxtLink
          :to="section.to"
          class="group flex h-full items-start gap-4 rounded-2xl border border-line bg-surface-raised p-5 transition-[border-color,transform] duration-200 hover:border-ink-muted focus-visible:outline-2 focus-visible:outline-accent active:scale-[0.99]"
        >
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
            <Icon
              :name="section.icon"
              class="size-5"
              aria-hidden="true"
            />
          </span>
          <span class="grid min-w-0 flex-1 gap-1">
            <span class="font-medium text-ink">{{ section.label }}</span>
            <span class="text-sm leading-relaxed text-ink-muted">{{ section.description }}</span>
          </span>
          <Icon
            name="ph:caret-right"
            class="mt-2.5 size-4 shrink-0 text-ink-muted transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
