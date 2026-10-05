// Fotos de ejemplo (Unsplash, licencia libre). Se reemplazan por las URLs del backend.
const unsplash = (id: string, width: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=75`

export const MOCK_IMAGES = {
  heroRedLace: unsplash('1642945680515-faada4c0ca7b', 1400),
  heroDetailStrap: unsplash('1592323731803-7c1fc65b1666', 600),

  categoryBras: unsplash('1528154201826-284bc74f89f0', 1000),
  categorySets: unsplash('1642945667252-c0a68e4c2904', 900),
  categoryBralettes: unsplash('1541182311535-f31f1aa15d12', 900),
  categoryPajamas: unsplash('1766056278944-ca0e4f49e61f', 900),
  categoryBasics: unsplash('1657753023885-7e30e39bf039', 900),

  collectionCarmin: unsplash('1625023489823-c9c1e36d6f2b', 1200),
  collectionSatin: unsplash('1770294758981-484ef12c1815', 1200),
  collectionMorning: unsplash('1651671488026-7a14be2e03c2', 1200),
  collectionEssentials: unsplash('1568441556126-f36ae0900180', 1200),

  productFloralBra: unsplash('1694290340663-65804773ce7a', 700),
  productBlackBra: unsplash('1572358764342-612d02e2d2d2', 700),
  productBlackLaceSet: unsplash('1561375958-669d8413fa06', 700),
  productPinkSatin: unsplash('1766056278948-dbb10f6d82bf', 700),
  productPinkSatinAlt: unsplash('1770294760762-1cd821ecc567', 700),
  productPajamaHanger: unsplash('1768696082668-411638a55476', 700),
  productSatinSet: unsplash('1770294758967-6ed2b93ce42c', 700),
  productSportBra: unsplash('1544838447-e08c8c6006ce', 700),
  productPinkLingerie: unsplash('1574539602047-548bf9557352', 700),

  storyPortrait: unsplash('1631242362679-d1d4d2d52af1', 1000),
} as const
