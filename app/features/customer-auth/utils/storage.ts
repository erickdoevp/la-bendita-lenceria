// localStorage puede no existir o lanzar (modo privado, cookies bloqueadas)
export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  }
  catch {
    return null
  }
}

export function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  }
  catch {
    // Sin almacenamiento solo se pierde la optimizacion; la sesion sigue en la cookie
  }
}
