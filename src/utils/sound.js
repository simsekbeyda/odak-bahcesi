// Ek ses dosyası gerektirmeyen kısa bir melodi (Web Audio API)
export function playChime(kind = 'success') {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const notes = kind === 'success' ? [523.25, 659.25, 783.99] : [392, 311.13]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.18
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.65)
    })
    setTimeout(() => ctx.close(), 1500)
  } catch {
    /* ses çalınamazsa uygulama etkilenmez */
  }
}
