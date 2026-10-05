export interface PasswordRule {
  /** Texto tal cual lo usa el backend en "La contraseña debe contener: ..." */
  label: string
  test: (value: string) => boolean
}

// Mismas reglas que el backend al registrar y al cambiar la contraseña
export const PASSWORD_RULES: PasswordRule[] = [
  { label: 'mínimo 12 caracteres', test: value => value.length >= 12 },
  { label: 'una mayúscula', test: value => /\p{Lu}/u.test(value) },
  { label: 'una minúscula', test: value => /\p{Ll}/u.test(value) },
  { label: 'un número', test: value => /\d/.test(value) },
  { label: 'un carácter especial', test: value => /[^\p{L}\d\s]/u.test(value) },
]

export function missingPasswordRules(value: string): string[] {
  return PASSWORD_RULES.filter(rule => !rule.test(value)).map(rule => rule.label)
}
