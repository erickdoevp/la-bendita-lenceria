/** Catalogo c_RegimenFiscal del SAT (el backend solo valida largo maximo 4). */
export const REGIMENES_FISCALES: { value: string, label: string }[] = [
  { value: '601', label: 'General de Ley Personas Morales' },
  { value: '603', label: 'Personas Morales con Fines no Lucrativos' },
  { value: '605', label: 'Sueldos y Salarios e Ingresos Asimilados a Salarios' },
  { value: '606', label: 'Arrendamiento' },
  { value: '607', label: 'Régimen de Enajenación o Adquisición de Bienes' },
  { value: '608', label: 'Demás ingresos' },
  { value: '610', label: 'Residentes en el Extranjero sin Establecimiento Permanente en México' },
  { value: '611', label: 'Ingresos por Dividendos (socios y accionistas)' },
  { value: '612', label: 'Personas Físicas con Actividades Empresariales y Profesionales' },
  { value: '614', label: 'Ingresos por intereses' },
  { value: '615', label: 'Régimen de los ingresos por obtención de premios' },
  { value: '616', label: 'Sin obligaciones fiscales' },
  { value: '620', label: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos' },
  { value: '621', label: 'Incorporación Fiscal' },
  { value: '622', label: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
  { value: '623', label: 'Opcional para Grupos de Sociedades' },
  { value: '624', label: 'Coordinados' },
  { value: '625', label: 'Actividades Empresariales con ingresos a través de Plataformas Tecnológicas' },
  { value: '626', label: 'Régimen Simplificado de Confianza (RESICO)' },
]

export function regimenLabel(value: string) {
  const regimen = REGIMENES_FISCALES.find(r => r.value === value)
  return regimen ? `${regimen.value} · ${regimen.label}` : value
}

export const FISCAL_IN_USE_MESSAGE = 'Estos datos fiscales ya se usaron en una factura y no se pueden eliminar.'
