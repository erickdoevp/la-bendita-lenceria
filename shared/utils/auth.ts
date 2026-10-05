import type { AuthUser } from '../types/auth'

export const ADMIN_ROLE = 'ROLE_ADMIN'

export function isAdminUser(user: Pick<AuthUser, 'roles'> | null | undefined): boolean {
  return user?.roles?.some(role => role.name === ADMIN_ROLE) ?? false
}
