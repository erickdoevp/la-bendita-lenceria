/** Nodo de un documento TipTap (JSON de ProseMirror). */
export interface RichTextNode {
  type?: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: { type: string, attrs?: Record<string, unknown> }[]
  content?: RichTextNode[]
}

export interface RichTextDoc {
  type: 'doc'
  content: RichTextNode[]
}

/** Texto plano a documento TipTap: cada bloque separado por linea en blanco es un parrafo. */
export function toRichTextDoc(text: string): RichTextDoc | undefined {
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
  if (!paragraphs.length) return undefined
  return {
    type: 'doc',
    content: paragraphs.map(text => ({ type: 'paragraph', content: [{ type: 'text', text }] })),
  }
}

/** Documento vacio: el backend no acepta null para "borrar" una descripcion. */
export const EMPTY_RICH_TEXT: RichTextDoc = { type: 'doc', content: [] }

/** Documento TipTap a texto plano para editarlo en un <textarea>: un parrafo por bloque. */
export function richTextToPlain(doc: unknown): string {
  if (!doc || typeof doc !== 'object') return ''
  const text = (node: RichTextNode): string =>
    node.text ?? (node.content ?? []).map(text).join(node.type === 'doc' ? '\n\n' : '')
  return text(doc as RichTextNode).trim()
}

/** Documento del editor tal cual, o `undefined` si no tiene texto (solo parrafos vacios). */
export function normalizeRichTextDoc(doc: RichTextDoc | null | undefined): RichTextDoc | undefined {
  return doc && richTextToPlain(doc) ? doc : undefined
}
