import type { H3Event } from 'h3'

const REFRESH_COOKIE = 'lb_admin_rt'
const SEVEN_DAYS = 60 * 60 * 24 * 7

// El refreshToken nunca llega al JS del navegador: solo viaja a /api/auth/*
const cookieOptions = {
  httpOnly: true,
  secure: !import.meta.dev,
  sameSite: 'strict',
  path: '/api/auth',
} as const

export function getRefreshCookie(event: H3Event) {
  return getCookie(event, REFRESH_COOKIE)
}

export function setRefreshCookie(event: H3Event, refreshToken: string) {
  setCookie(event, REFRESH_COOKIE, refreshToken, { ...cookieOptions, maxAge: SEVEN_DAYS })
}

export function clearRefreshCookie(event: H3Event) {
  deleteCookie(event, REFRESH_COOKIE, cookieOptions)
}
