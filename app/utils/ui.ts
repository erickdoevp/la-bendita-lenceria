import type { ButtonProps } from '@nuxt/ui'

/** Boton "Reintentar" para las acciones de un UAlert de error. */
export function retryAction(onClick: () => unknown): ButtonProps[] {
  return [{ label: 'Reintentar', color: 'error', variant: 'outline', size: 'xs', onClick: () => void onClick() }]
}
