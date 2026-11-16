import { SPECIES } from '../utils/plants'

// Gövdenin tepe noktası (y): aşama 0 = tohum ... 4 = tam açmış bitki
const STEM_TOP = [88, 72, 56, 44, 34]
const BASE_Y = 88

const WITHERED = {
  stem: '#8b7d5c',
  leaf: '#a3916a',
  petal: '#b3a391',
  accent: '#7d6b58',
}

function Leaf({ y, side, color, size = 1 }) {
  const dir = side === 'left' ? -1 : 1
  const d = `M50 ${y} q ${dir * 14 * size} ${-12 * size} ${dir * 22 * size} ${-3 * size} q ${-dir * 10 * size} ${9 * size} ${-dir * 22 * size} ${3 * size}z`
  return <path d={d} fill={color} />
}

function FlowerHead({ species, petal, accent }) {
  switch (species) {
    case 'lale':
      return (
        <g>
          <path d="M-11 -2 Q-13 -18 -7 -21 L0 -13 L7 -21 Q13 -18 11 -2 Q0 8 -11 -2z" fill={petal} />
          <path d="M-5 -4 Q0 -24 5 -4z" fill={accent} opacity="0.75" />
        </g>
      )
    case 'aycicegi':
      return (
        <g>
          {Array.from({ length: 12 }, (_, i) => (
            <ellipse key={i} cx="0" cy="-12" rx="3.6" ry="7" fill={petal} transform={`rotate(${i * 30})`} />
          ))}
          <circle r="8" fill={accent} />
          {[[-3, -2], [2, -3], [0, 2], [3, 2], [-3, 3]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1" fill="#4a2c12" />
          ))}
        </g>
      )
    case 'papatya':
      return (
        <g>
          {Array.from({ length: 10 }, (_, i) => (
            <ellipse key={i} cx="0" cy="-9" rx="3" ry="8" fill={petal} stroke="#d9d4c7" strokeWidth="0.6" transform={`rotate(${i * 36})`} />
          ))}
          <circle r="5" fill={accent} />
        </g>
      )
    case 'lavanta':
      return (
        <g>
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i}>
              <ellipse cx="-3" cy={-i * 4.5} rx="3" ry="3.8" fill={i % 2 ? accent : petal} />
              <ellipse cx="3" cy={-i * 4.5 - 2} rx="3" ry="3.8" fill={i % 2 ? petal : accent} />
            </g>
          ))}
        </g>
      )
    case 'agac':
      return (
        <g>
          <circle cx="0" cy="-8" r="15" fill={petal} />
          <circle cx="-12" cy="0" r="11" fill={petal} />
          <circle cx="12" cy="0" r="11" fill={petal} />
          <circle cx="-5" cy="-14" r="8" fill="#ffffff" opacity="0.12" />
          {[[-8, -10], [6, -14], [10, 2], [-12, 3], [2, -2]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.4" fill={accent} />
          ))}
        </g>
      )
    default:
      return null
  }
}

function Cactus({ stage, body, accent }) {
  const top = STEM_TOP[stage]
  const h = BASE_Y - top
  return (
    <g>
      <rect x="41" y={top} width="18" height={h + 2} rx="9" fill={body} />
      <path d={`M46 ${top + 6} V${BASE_Y} M54 ${top + 6} V${BASE_Y}`} stroke="#000" strokeOpacity="0.12" strokeWidth="1.2" />
      {stage >= 2 && (
        <>
          <path d={`M41 ${top + h * 0.55} h-8 a4 4 0 0 1 -4 -4 v-10 a4 4 0 0 1 8 0 v6 h4`} fill={body} />
          <path d={`M59 ${top + h * 0.4} h8 a4 4 0 0 0 4 -4 v-8 a4 4 0 0 0 -8 0 v4 h-4`} fill={body} />
        </>
      )}
      {stage >= 4 &&
        Array.from({ length: 5 }, (_, i) => (
          <ellipse key={i} cx="50" cy={top - 4} rx="2.6" ry="5" fill={accent} transform={`rotate(${i * 72} 50 ${top})`} />
        ))}
      {stage >= 4 && <circle cx="50" cy={top} r="2.4" fill="#f7d154" />}
    </g>
  )
}

/**
 * Bitki çizimi.
 * stage: 0-4 arası büyüme aşaması
 * withered: oturum yarıda bırakıldıysa soluk, eğilmiş görünüm
 * animate: bahçeye yeni eklenen bitki için "büyüme" animasyonu
 */
export default function Plant({ species = 'lale', stage = 4, withered = false, animate = false, size = 96, sway = true }) {
  const sp = SPECIES[species] ?? SPECIES.lale
  const stemColor = withered ? WITHERED.stem : species === 'agac' ? '#7a5230' : '#3f8f4f'
  const leafColor = withered ? WITHERED.leaf : '#5bb36a'
  const petal = withered ? WITHERED.petal : sp.petal
  const accent = withered ? WITHERED.accent : sp.accent
  const top = STEM_TOP[stage]
  const h = BASE_Y - top
  const headScale = stage === 3 ? 0.55 : 1

  const classes = ['plant']
  if (animate) classes.push('plant--grow')
  if (withered) classes.push('plant--withered')
  else if (sway && stage > 0) classes.push('plant--sway')

  return (
    <svg
      className={classes.join(' ')}
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      role="img"
      aria-label={`${sp.name}${withered ? ' (solmuş)' : ''}`}
    >
      <ellipse cx="50" cy="116" rx="26" ry="3" fill="#000" opacity="0.08" />
      <ellipse cx="50" cy={BASE_Y} rx="22" ry="3.5" fill="#5a3a22" />

      <g className="plant__grow">
        <g className="plant__body">
          {stage >= 1 && species === 'kaktus' && <Cactus stage={stage} body={withered ? WITHERED.leaf : sp.petal} accent={accent} />}

          {stage >= 1 && species !== 'kaktus' && (
            <>
              <path
                d={`M50 ${BASE_Y} Q${species === 'agac' ? 50 : 47} ${BASE_Y - h / 2} 50 ${top}`}
                stroke={stemColor}
                strokeWidth={species === 'agac' ? 5 : species === 'lavanta' ? 2.2 : 3}
                strokeLinecap="round"
                fill="none"
              />
              {species !== 'agac' && <Leaf y={BASE_Y - h * 0.3} side="left" color={leafColor} size={stage === 1 ? 0.6 : 0.9} />}
              {species !== 'agac' && <Leaf y={BASE_Y - h * 0.3 - 2} side="right" color={leafColor} size={stage === 1 ? 0.6 : 0.9} />}
              {stage >= 2 && species !== 'agac' && <Leaf y={BASE_Y - h * 0.62} side="right" color={leafColor} size={0.7} />}
              {stage >= 2 && species === 'agac' && stage < 3 && (
                <>
                  <Leaf y={top + 4} side="left" color={leafColor} size={0.7} />
                  <Leaf y={top + 2} side="right" color={leafColor} size={0.7} />
                </>
              )}
              {stage >= 3 && (
                <g className="plant__head" transform={`translate(50 ${top}) scale(${headScale})`}>
                  <FlowerHead species={species} petal={petal} accent={accent} />
                </g>
              )}
            </>
          )}
        </g>
      </g>

      {/* saksı */}
      <path d="M29 90 h42 l-5 25 h-32z" fill={withered ? '#9c7a63' : '#c4703f'} />
      <rect x="25" y="84" width="50" height="9" rx="2.5" fill={withered ? '#ad8a72' : '#d9844f'} />
      <rect x="25" y="84" width="50" height="3" rx="1.5" fill="#fff" opacity="0.18" />

      {stage === 0 && <ellipse className="plant__seed" cx="50" cy="82" rx="3.5" ry="2.6" fill="#7a5230" />}
    </svg>
  )
}
