// Datos de ejemplo del inicio. Imitan la forma que tendran tras mapear los DTOs del backend.
import { STORE_ROUTES } from '~/features/store-catalog'
import type { HomeCategory, HomeCollection, HomeHeroContent } from '../types'
import { MOCK_IMAGES as img } from './images'

export const HOME_HERO_MOCK: HomeHeroContent = {
  eyebrow: 'Colección Carmín',
  title: 'Encaje que se siente tuyo',
  highlight: 'tuyo',
  subtitle: 'Piezas cómodas y delicadas, pensadas para usarse todos los días y no solo en ocasiones especiales.',
  primaryCta: { label: 'Comprar ahora', to: STORE_ROUTES.newArrivals },
  secondaryCta: { label: 'Ver colección', to: STORE_ROUTES.collection('carmin') },
  image: { src: img.heroRedLace, alt: 'Modelo con conjunto de encaje rojo sentada en la cama' },
  detailImage: { src: img.heroDetailStrap, alt: 'Manos ajustando el tirante de un brasier negro' },
}

export const HOME_CATEGORIES_MOCK: HomeCategory[] = [
  { id: 'c-01', name: 'Brasieres', slugs: ['lenceria', 'brasieres'], imageUrl: img.categoryBras, summary: 'Push up, con varilla y sin varilla' },
  { id: 'c-02', name: 'Trajes de baño', slugs: ['trajes-de-bano'], imageUrl: img.categorySwim, summary: 'Bikinis y completos' },
  { id: 'c-03', name: 'Bralettes', slugs: ['lenceria', 'bralettes'], imageUrl: img.categoryBralettes, summary: 'Encaje ligero, sin relleno' },
  { id: 'c-04', name: 'Pijamas', slugs: ['pijamas'], imageUrl: img.categoryPajamas, summary: 'Satín y algodón' },
  { id: 'c-05', name: 'Conjuntos', slugs: ['lenceria', 'conjuntos'], imageUrl: img.categorySets, summary: 'Brasier y panty a juego' },
]

export const HOME_COLLECTIONS_MOCK: HomeCollection[] = [
  {
    id: 'col-01',
    name: 'Carmín',
    slug: 'carmin',
    imageUrl: img.collectionCarmin,
    summary: 'Encaje rojo y negro con transparencias. Para las noches que quieres recordar.',
    productCount: 14,
  },
  {
    id: 'col-02',
    name: 'Satín de noche',
    slug: 'satin-de-noche',
    imageUrl: img.collectionSatin,
    summary: 'Pijamas y batas de satín suave que no se pegan al cuerpo.',
    productCount: 9,
  },
  {
    id: 'col-03',
    name: 'Luz de mañana',
    slug: 'luz-de-manana',
    imageUrl: img.collectionMorning,
    summary: 'Tonos nude y marfil que no se notan bajo la ropa clara.',
    productCount: 11,
  },
  {
    id: 'col-04',
    name: 'Esenciales',
    slug: 'esenciales',
    imageUrl: img.collectionEssentials,
    summary: 'Los básicos que más se repiten en tu cajón, en varios colores.',
    productCount: 23,
  },
]
