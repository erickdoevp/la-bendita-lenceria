// Arbol de ejemplo con la forma que tendra tras mapear GET /categories/tree.
import type { StoreCategory } from '../types'
import { unsplash } from './unsplash'

type Seed = [name: string, slug: string, children?: Seed[]]


/** Arma nodos con ids estables a partir de una lista compacta. */
function build(seeds: Seed[], prefix: string): StoreCategory[] {
  return seeds.map(([name, slug, children = []]) => {
    const id = `${prefix}-${slug}`
    return { id, name, slug, summary: null, imageUrl: null, children: build(children, id) }
  })
}

const [lingerie, swimwear, pajamas] = build([
  ['Lencería', 'lenceria', [
    ['Brasieres', 'brasieres', [
      ['Push up', 'push-up'],
      ['Con varilla', 'con-varilla'],
      ['Sin varilla', 'sin-varilla'],
      ['Strapless', 'strapless'],
    ]],
    ['Bralettes', 'bralettes', [
      ['De encaje', 'encaje'],
      ['Básicos', 'basicos'],
    ]],
    ['Panties', 'panties', [
      ['Bikini', 'bikini'],
      ['Tanga', 'tanga'],
      ['Cachetero', 'cachetero'],
    ]],
    ['Conjuntos', 'conjuntos'],
    ['Bodies', 'bodies'],
  ]],
  ['Trajes de baño', 'trajes-de-bano', [
    ['Bikinis', 'bikinis', [
      ['Triangulares', 'triangulares'],
      ['Bandeau', 'bandeau'],
      ['Talle alto', 'talle-alto'],
    ]],
    ['Completos', 'completos', [
      ['Escotados', 'escotados'],
      ['Moldeadores', 'moldeadores'],
    ]],
    ['Salidas de playa', 'salidas-de-playa'],
  ]],
  ['Pijamas', 'pijamas', [
    ['Satín', 'satin', [
      ['Manga larga', 'manga-larga'],
      ['Con short', 'con-short'],
    ]],
    ['Algodón', 'algodon', [
      ['Manga larga', 'manga-larga'],
      ['Con short', 'con-short'],
    ]],
    ['Batas', 'batas'],
    ['Camisones', 'camisones'],
  ]],
], 'cat') as [StoreCategory, StoreCategory, StoreCategory]

lingerie.summary = 'Brasieres, bralettes, panties y conjuntos con tallas que sí corresponden.'
lingerie.imageUrl = unsplash('1642945680515-faada4c0ca7b', 1600)
swimwear.summary = 'Bikinis y completos para la playa, la alberca o el viaje que ya tienes en mente.'
swimwear.imageUrl = unsplash('1593836788196-9fd68e904906', 1600)
pajamas.summary = 'Satín y algodón para dormir cómoda, en manga larga, short o bata.'
pajamas.imageUrl = unsplash('1766056278944-ca0e4f49e61f', 1600)

export const CATEGORY_TREE_MOCK: StoreCategory[] = [lingerie, swimwear, pajamas]
