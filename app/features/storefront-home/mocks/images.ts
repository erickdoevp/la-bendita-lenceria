// Fotos de ejemplo (Unsplash, licencia libre). Se reemplazan por las URLs del backend.
import { unsplash } from '~/features/store-catalog'

export const MOCK_IMAGES = {
  heroRedLace: unsplash('1642945680515-faada4c0ca7b', 1400),
  heroDetailStrap: unsplash('1592323731803-7c1fc65b1666', 600),

  categoryBras: unsplash('1528154201826-284bc74f89f0', 1000),
  categorySets: unsplash('1642945667252-c0a68e4c2904', 900),
  categoryBralettes: unsplash('1541182311535-f31f1aa15d12', 900),
  categoryPajamas: unsplash('1766056278944-ca0e4f49e61f', 900),
  categorySwim: unsplash('1606792109963-7b34205b1333', 900),

  collectionCarmin: unsplash('1625023489823-c9c1e36d6f2b', 1200),
  collectionSatin: unsplash('1770294758981-484ef12c1815', 1200),
  collectionMorning: unsplash('1651671488026-7a14be2e03c2', 1200),
  collectionEssentials: unsplash('1568441556126-f36ae0900180', 1200),

  storyPortrait: unsplash('1631242362679-d1d4d2d52af1', 1000),
} as const
