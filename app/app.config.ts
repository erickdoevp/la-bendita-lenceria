// Tema de Nuxt UI (admin, cuenta y auth). Los colores salen de los tokens de
// app/assets/css/main.css; aqui se eligen paletas, iconos y estilos por componente.
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'frambuesa',
      neutral: 'zinc',
    },
    icons: {
      arrowDown: 'ph:arrow-down',
      arrowLeft: 'ph:arrow-left',
      arrowRight: 'ph:arrow-right',
      arrowUp: 'ph:arrow-up',
      caution: 'ph:warning-circle',
      check: 'ph:check',
      chevronDoubleLeft: 'ph:caret-double-left',
      chevronDoubleRight: 'ph:caret-double-right',
      chevronDown: 'ph:caret-down',
      chevronLeft: 'ph:caret-left',
      chevronRight: 'ph:caret-right',
      chevronUp: 'ph:caret-up',
      close: 'ph:x',
      copy: 'ph:copy',
      copyCheck: 'ph:check',
      dark: 'ph:moon',
      drag: 'ph:dots-six-vertical',
      ellipsis: 'ph:dots-three',
      error: 'ph:x-circle',
      external: 'ph:arrow-up-right',
      eye: 'ph:eye',
      eyeOff: 'ph:eye-slash',
      file: 'ph:file',
      folder: 'ph:folder',
      folderOpen: 'ph:folder-open',
      hash: 'ph:hash',
      info: 'ph:info',
      light: 'ph:sun',
      loading: 'ph:circle-notch',
      menu: 'ph:list',
      minus: 'ph:minus',
      panelClose: 'ph:sidebar-simple',
      panelOpen: 'ph:sidebar-simple',
      plus: 'ph:plus',
      reload: 'ph:arrow-counter-clockwise',
      search: 'ph:magnifying-glass',
      stop: 'ph:square',
      star: 'ph:star',
      success: 'ph:check-circle',
      system: 'ph:monitor',
      tip: 'ph:lightbulb',
      upload: 'ph:upload-simple',
      warning: 'ph:warning',
    },

    // Estilos por componente. Se mezclan con tailwind-merge sobre los de Nuxt UI:
    // cambiar aqui una clase cambia ese componente en todo admin, cuenta y auth.
    alert: {
      defaultVariants: { variant: 'subtle' },
    },
    badge: {
      defaultVariants: { variant: 'subtle' },
    },
    pageHeader: {
      slots: {
        root: 'border-none py-0',
        title: 'text-2xl font-semibold tracking-tight md:text-3xl',
        description: 'max-w-[65ch] text-base leading-relaxed',
      },
      variants: {
        title: { true: { description: 'mt-2' } },
      },
    },
    card: {
      slots: {
        title: 'tracking-tight',
        description: 'max-w-[65ch] leading-relaxed',
      },
    },
    empty: {
      defaultVariants: { size: 'sm' },
      slots: { root: 'items-start', header: 'items-start text-left', description: 'text-left', actions: 'justify-start' },
    },
    formField: {
      slots: { help: 'leading-snug' },
    },
    // Los controles de formulario ocupan el ancho de su contenedor
    input: { slots: { root: 'w-full' } },
    inputNumber: { slots: { root: 'w-full' } },
    select: { slots: { base: 'w-full' } },
    selectMenu: { slots: { base: 'w-full' } },
    textarea: { slots: { root: 'w-full' } },
  },
})
