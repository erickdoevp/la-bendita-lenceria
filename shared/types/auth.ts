// Contrato con el backend de autenticacion (/api/v1). Compartido entre app y server.

export interface AuthRole {
  id: number
  name: string
}

export interface AuthUser {
  id: string
  name: string
  firstLastName: string
  secondLastName: string | null
  displayName: string
  email: string
  username: string
  phoneNumber: string | null
  avatarImgUrl: string | null
  privacyPolicyAccepted?: boolean
  privacyPolicyAcceptedAt?: string | null
  privacyPolicyVersion?: string | null
  lastSignInAt: string | null
  createdAt: string
  updatedAt: string
  roles: AuthRole[]
}

/** Respuesta del backend en /auth/login y /auth/refresh. */
export interface BackendTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
}

/** Respuesta del BFF en /api/auth/login (el refreshToken va en cookie httpOnly). */
export interface SessionResponse {
  accessToken: string
  user: AuthUser
}

/** Respuesta del BFF en /api/auth/refresh. */
export interface RefreshResponse {
  accessToken: string
}

/** Cuerpo de error estandar del backend. */
export interface BackendError {
  status: number
  error: string
  message: string
  errors?: Record<string, string>
}
