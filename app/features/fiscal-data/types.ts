// Contrato con /api/v1/fiscal (ver CUENTA-CLIENTE, seccion 6).

/** UserFiscalDataResponse */
export interface FiscalProfile {
  id: string
  userId: string
  rfc: string
  razonSocial: string
  /** Clave c_RegimenFiscal del SAT, p. ej. "612". */
  regimenFiscal: string
  /** CP del domicilio fiscal. */
  cp: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}
