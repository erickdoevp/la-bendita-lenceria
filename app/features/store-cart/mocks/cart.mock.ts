// Bolsa de ejemplo guardada en localStorage. Imita las respuestas del backend para
// que la UI se pueda probar completa (stock, cantidades, errores) sin servidor.
import { getMockCatalog } from '~/features/store-catalog'
import { CART_MOCK_STORAGE_KEY, MAX_LINE_QUANTITY } from '../constants'
import type { AddToCartInput, Cart, CartLine } from '../types'

/** Error de negocio del mock (stock, limite); su mensaje ya es para la clienta. */
export class CartMockError extends Error {}

/** Primera visita: algunas piezas para ver la bolsa con contenido. */
function seedLines(): CartLine[] {
  const catalog = getMockCatalog().filter(p => p.colors.length && p.sizes.length)
  const picks = [catalog[2], catalog[Math.floor(catalog.length / 2)], catalog[catalog.length - 3]]
  const stocks = [8, 2, 5]
  return picks.flatMap((product, index) => {
    if (!product) return []
    const color = product.colors[0]!
    const size = product.sizes[Math.min(1, product.sizes.length - 1)]!
    return [{
      id: `line-seed-${index}`,
      variantId: `${product.id}-seed-${index}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      colorName: color.name,
      colorHex: color.hex,
      size,
      unitPrice: product.price,
      compareAtPrice: product.compareAtPrice,
      quantity: index === 0 ? 2 : 1,
      stock: stocks[index]!,
    }]
  })
}

function read(): Cart {
  try {
    const raw = localStorage.getItem(CART_MOCK_STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Cart
  }
  catch {
    // JSON corrupto o almacenamiento bloqueado: se arranca de nuevo
  }
  const cart = { id: 'cart-mock', lines: seedLines() }
  write(cart)
  return cart
}

function write(cart: Cart) {
  try {
    localStorage.setItem(CART_MOCK_STORAGE_KEY, JSON.stringify(cart))
  }
  catch {
    // Sin almacenamiento la bolsa dura lo que dure la pestana
  }
}

const stockMessage = (stock: number) =>
  stock <= 0
    ? 'Esta talla se agotó.'
    : stock === 1 ? 'Solo queda 1 pieza en esta talla.' : `Solo quedan ${stock} piezas en esta talla.`

function findLine(cart: Cart, lineId: string) {
  const line = cart.lines.find(l => l.id === lineId)
  if (!line) throw new CartMockError('Esta pieza ya no está en tu bolsa.')
  return line
}

export const cartMock = {
  get: (): Cart => read(),

  add(input: AddToCartInput): Cart {
    const cart = read()
    const existing = cart.lines.find(l => l.variantId === input.variantId)
    const quantity = (existing?.quantity ?? 0) + input.quantity
    const limit = Math.min(input.line.stock, MAX_LINE_QUANTITY)
    if (quantity > input.line.stock) {
      const left = input.line.stock - (existing?.quantity ?? 0)
      throw new CartMockError(existing && left <= 0
        ? 'Ya tienes en tu bolsa todas las piezas disponibles de esta talla.'
        : stockMessage(left))
    }
    if (quantity > limit) throw new CartMockError(`Puedes llevar hasta ${MAX_LINE_QUANTITY} piezas de la misma talla.`)

    if (existing) {
      existing.quantity = quantity
      existing.stock = input.line.stock
      // La linea agregada sube al principio para que se vea al abrir la bolsa
      cart.lines = [existing, ...cart.lines.filter(l => l !== existing)]
    }
    else {
      cart.lines.unshift({ ...input.line, id: `line-${Date.now().toString(36)}`, variantId: input.variantId, quantity })
    }
    write(cart)
    return cart
  },

  update(lineId: string, quantity: number): Cart {
    const cart = read()
    const line = findLine(cart, lineId)
    if (quantity > line.stock) throw new CartMockError(stockMessage(line.stock))
    line.quantity = Math.max(1, Math.min(quantity, MAX_LINE_QUANTITY))
    write(cart)
    return cart
  },

  remove(lineId: string): Cart {
    const cart = read()
    cart.lines = cart.lines.filter(l => l.id !== lineId)
    write(cart)
    return cart
  },

  /** Restaura una linea quitada en su posicion original. */
  restore(line: CartLine, index: number): Cart {
    const cart = read()
    if (!cart.lines.some(l => l.variantId === line.variantId)) cart.lines.splice(index, 0, line)
    write(cart)
    return cart
  },
}
