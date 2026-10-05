// Contrato con /api/v1/addresses (ver CUENTA-CLIENTE, seccion 5).

/** AddressResponse */
export interface Address {
  id: string
  userId: string
  alias: string
  recipientName: string
  phone: string
  street: string
  exteriorNumber: string
  interiorNumber: string | null
  colonia: string
  cp: string
  municipio: string
  estado: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface PostalCodeInfo {
  cp: string
  municipio: string
  estado: string
}
