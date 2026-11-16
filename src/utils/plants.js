export const SPECIES = {
  lale: { name: 'Lale', petal: '#e8505b', accent: '#f7a1a8' },
  aycicegi: { name: 'Ayçiçeği', petal: '#f7c531', accent: '#7a4b23' },
  papatya: { name: 'Papatya', petal: '#ffffff', accent: '#f5c242' },
  lavanta: { name: 'Lavanta', petal: '#9b7fd1', accent: '#c9b5ef' },
  kaktus: { name: 'Kaktüs', petal: '#4f9a5f', accent: '#f27ea9' },
  agac: { name: 'Mini Ağaç', petal: '#4f9a5f', accent: '#e8505b' },
}

export const SPECIES_KEYS = Object.keys(SPECIES)

// 50 dakika ve üzeri oturumlar "değerli" bir ağaç verir
export function pickSpecies(minutes) {
  if (minutes >= 50) return 'agac'
  const pool = SPECIES_KEYS.filter((k) => k !== 'agac')
  return pool[Math.floor(Math.random() * pool.length)]
}
