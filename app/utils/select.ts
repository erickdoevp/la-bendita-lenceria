/**
 * USelect (Reka UI) no acepta '' como valor de una opcion. Los filtros usan ''
 * para "Todos": este valor lo representa dentro del select.
 */
export const SELECT_ALL = '__all__'

/** v-model para un USelect cuyo valor vacio ('') significa "Todos". */
export function useSelectAll<T extends object, K extends keyof T>(target: T, key: K) {
  return computed({
    get: () => (target[key] === '' ? SELECT_ALL : String(target[key])),
    set: (value: string) => {
      target[key] = (value === SELECT_ALL ? '' : value) as T[K]
    },
  })
}
