const MUSCLE_COLOR = '#e63946'
const MUSCLE_BASE = '#c8c8c8'
const SKIN = '#d4a882'
const SKIN_DARK = '#b8926a'
const SHADOW = '#a07850'

function FrontBody({ activeSet }) {
  const c = (m) => activeSet.has(m) ? MUSCLE_COLOR : MUSCLE_BASE
  const o = (m) => activeSet.has(m) ? 0.95 : 0.35

  return (
    <g>
      <ellipse cx="150" cy="46" rx="22" ry="25" fill={SKIN} />
      <ellipse cx="150" cy="42" rx="18" ry="20" fill={SKIN_DARK} opacity="0.3" />
      <rect x="138" y="68" width="24" height="16" rx="4" fill={SKIN} />

      <path d="M 138 70 C 132 72 126 76 122 82 L 130 88 C 138 82 150 80 150 80 C 150 80 162 82 170 88 L 178 82 C 174 76 168 72 162 70 Z"
        fill={c('traps')} opacity={o('traps')} />

      <ellipse cx="102" cy="104" rx="18" ry="20" fill={c('shoulders')} opacity={o('shoulders')} />
      <ellipse cx="198" cy="104" rx="18" ry="20" fill={c('shoulders')} opacity={o('shoulders')} />

      <path d="M 122 92 C 110 96 104 108 106 120 C 108 130 118 136 132 132 L 148 128 L 148 100 C 138 96 130 90 122 92 Z"
        fill={c('chest')} opacity={o('chest')} />
      <path d="M 178 92 C 190 96 196 108 194 120 C 192 130 182 136 168 132 L 152 128 L 152 100 C 162 96 170 90 178 92 Z"
        fill={c('chest')} opacity={o('chest')} />

      <path d="M 82 122 C 72 130 68 148 70 164 C 72 176 80 184 90 182 C 100 180 106 168 104 154 C 102 140 94 116 82 122 Z"
        fill={c('biceps')} opacity={o('biceps')} />
      <path d="M 218 122 C 228 130 232 148 230 164 C 228 176 220 184 210 182 C 200 180 194 168 196 154 C 198 140 206 116 218 122 Z"
        fill={c('biceps')} opacity={o('biceps')} />

      <path d="M 72 186 C 64 196 62 214 64 228 C 66 240 74 246 82 244 C 90 242 94 230 92 216 C 90 202 80 182 72 186 Z"
        fill={c('forearms')} opacity={o('forearms')} />
      <path d="M 228 186 C 236 196 238 214 236 228 C 234 240 226 246 218 244 C 210 242 206 230 208 216 C 210 202 220 182 228 186 Z"
        fill={c('forearms')} opacity={o('forearms')} />

      <rect x="134" y="138" width="14" height="20" rx="2" fill={c('abs')} opacity={o('abs')} />
      <rect x="152" y="138" width="14" height="20" rx="2" fill={c('abs')} opacity={o('abs')} />
      <rect x="133" y="162" width="15" height="20" rx="2" fill={c('abs')} opacity={o('abs')} />
      <rect x="152" y="162" width="15" height="20" rx="2" fill={c('abs')} opacity={o('abs')} />
      <rect x="134" y="186" width="14" height="18" rx="2" fill={c('abs')} opacity={o('abs')} />
      <rect x="152" y="186" width="14" height="18" rx="2" fill={c('abs')} opacity={o('abs')} />
      <line x1="150" y1="136" x2="150" y2="204" stroke={SHADOW} strokeWidth="1" opacity="0.25" />

      <path d="M 114 148 C 106 156 104 172 108 186 C 112 198 120 202 128 198 C 136 194 136 178 132 164 C 128 150 122 142 114 148 Z"
        fill={c('obliques')} opacity={o('obliques')} />
      <path d="M 186 148 C 194 156 196 172 192 186 C 188 198 180 202 172 198 C 164 194 164 178 168 164 C 172 150 178 142 186 148 Z"
        fill={c('obliques')} opacity={o('obliques')} />

      <path d="M 110 248 C 100 258 96 278 98 298 C 100 316 110 328 122 326 C 134 324 140 310 138 292 C 136 274 128 244 110 248 Z"
        fill={c('quads')} opacity={o('quads')} />
      <path d="M 190 248 C 200 258 204 278 202 298 C 200 316 190 328 178 326 C 166 324 160 310 162 292 C 164 274 172 244 190 248 Z"
        fill={c('quads')} opacity={o('quads')} />

      <ellipse cx="120" cy="334" rx="14" ry="10" fill={SKIN_DARK} opacity="0.5" />
      <ellipse cx="180" cy="334" rx="14" ry="10" fill={SKIN_DARK} opacity="0.5" />

      <path d="M 112 344 C 104 354 102 372 106 386 C 110 398 120 404 128 400 C 136 396 138 382 136 368 C 134 354 124 340 112 344 Z"
        fill={c('calves')} opacity={o('calves')} />
      <path d="M 188 344 C 196 354 198 372 194 386 C 190 398 180 404 172 400 C 164 396 162 382 164 368 C 166 354 176 340 188 344 Z"
        fill={c('calves')} opacity={o('calves')} />

      <path d="M 148 90 L 148 136 M 152 90 L 152 136" stroke={SHADOW} strokeWidth="0.8" fill="none" opacity="0.2" />
    </g>
  )
}

function BackBody({ activeSet }) {
  const c = (m) => activeSet.has(m) ? MUSCLE_COLOR : MUSCLE_BASE
  const o = (m) => activeSet.has(m) ? 0.95 : 0.35

  return (
    <g>
      <ellipse cx="150" cy="46" rx="22" ry="25" fill={SKIN} />
      <ellipse cx="150" cy="44" rx="16" ry="18" fill={SKIN_DARK} opacity="0.25" />
      <rect x="138" y="68" width="24" height="16" rx="4" fill={SKIN} />

      <path d="M 138 70 C 128 74 116 82 112 92 L 120 100 C 130 90 150 86 150 86 C 150 86 170 90 180 100 L 188 92 C 184 82 172 74 162 70 Z"
        fill={c('traps')} opacity={o('traps')} />

      <ellipse cx="100" cy="106" rx="18" ry="20" fill={c('shoulders')} opacity={o('shoulders')} />
      <ellipse cx="200" cy="106" rx="18" ry="20" fill={c('shoulders')} opacity={o('shoulders')} />

      <path d="M 116 116 C 100 126 96 148 100 166 C 104 182 116 192 128 188 C 140 184 148 168 148 148 L 148 110 C 136 108 126 112 116 116 Z"
        fill={c('back')} opacity={o('back')} />
      <path d="M 184 116 C 200 126 204 148 200 166 C 196 182 184 192 172 188 C 160 184 152 168 152 148 L 152 110 C 164 108 174 112 184 116 Z"
        fill={c('back')} opacity={o('back')} />

      <path d="M 96 148 C 84 162 82 184 88 200 C 94 214 106 220 116 214 C 126 208 128 190 124 174 C 120 158 110 142 96 148 Z"
        fill={c('lats')} opacity={o('lats')} />
      <path d="M 204 148 C 216 162 218 184 212 200 C 206 214 194 220 184 214 C 174 208 172 190 176 174 C 180 158 190 142 204 148 Z"
        fill={c('lats')} opacity={o('lats')} />

      <path d="M 80 126 C 70 136 66 156 68 172 C 70 184 78 192 88 190 C 98 188 102 174 100 160 C 98 146 90 118 80 126 Z"
        fill={c('triceps')} opacity={o('triceps')} />
      <path d="M 220 126 C 230 136 234 156 232 172 C 230 184 222 192 212 190 C 202 188 198 174 200 160 C 202 146 210 118 220 126 Z"
        fill={c('triceps')} opacity={o('triceps')} />

      <path d="M 128 210 C 120 218 118 232 120 244 C 122 254 130 262 140 260 L 150 258 L 150 210 Z"
        fill={c('lower_back')} opacity={o('lower_back')} />
      <path d="M 172 210 C 180 218 182 232 180 244 C 178 254 170 262 160 260 L 150 258 L 150 210 Z"
        fill={c('lower_back')} opacity={o('lower_back')} />

      <path d="M 114 250 C 102 262 98 282 102 298 C 106 312 118 320 130 314 C 142 308 148 292 146 276 C 144 260 128 242 114 250 Z"
        fill={c('glutes')} opacity={o('glutes')} />
      <path d="M 186 250 C 198 262 202 282 198 298 C 194 312 182 320 170 314 C 158 308 152 292 154 276 C 156 260 172 242 186 250 Z"
        fill={c('glutes')} opacity={o('glutes')} />

      <path d="M 112 318 C 102 328 98 350 102 368 C 106 382 118 390 128 384 C 138 378 140 362 136 346 C 132 330 124 310 112 318 Z"
        fill={c('hamstrings')} opacity={o('hamstrings')} />
      <path d="M 188 318 C 198 328 202 350 198 368 C 194 382 182 390 172 384 C 162 378 160 362 164 346 C 168 330 176 310 188 318 Z"
        fill={c('hamstrings')} opacity={o('hamstrings')} />

      <path d="M 112 392 C 104 402 102 420 106 434 C 110 446 120 452 128 448 C 136 444 138 430 136 416 C 134 402 124 388 112 392 Z"
        fill={c('calves')} opacity={o('calves')} />
      <path d="M 188 392 C 196 402 198 420 194 434 C 190 446 180 452 172 448 C 164 444 162 430 164 416 C 166 402 176 388 188 392 Z"
        fill={c('calves')} opacity={o('calves')} />

      <path d="M 150 90 L 150 258" stroke={SHADOW} strokeWidth="1" fill="none" opacity="0.2" />
    </g>
  )
}

export default function BodySVG({ activeMuscles = [], size = 200, showBoth = false }) {
  const activeSet = new Set(activeMuscles)
  const BACK_ONLY = ['back', 'lats', 'lower_back', 'hamstrings', 'glutes', 'triceps']
  const FRONT_ONLY = ['chest', 'biceps', 'abs', 'quads', 'obliques', 'forearms']
  const hasBack = activeMuscles.some(m => BACK_ONLY.includes(m))
  const hasFront = activeMuscles.some(m => FRONT_ONLY.includes(m))
  const w = size
  const h = size * 1.6

  if (showBoth || (hasBack && hasFront)) {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '9px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Face</p>
          <svg viewBox="0 0 300 460" width={w} height={h}><FrontBody activeSet={activeSet} /></svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '9px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Dos</p>
          <svg viewBox="0 0 300 460" width={w} height={h}><BackBody activeSet={activeSet} /></svg>
        </div>
      </div>
    )
  }

  if (hasBack) {
    return <svg viewBox="0 0 300 460" width={w} height={h} style={{ display: 'block' }}><BackBody activeSet={activeSet} /></svg>
  }

  return <svg viewBox="0 0 300 460" width={w} height={h} style={{ display: 'block' }}><FrontBody activeSet={activeSet} /></svg>
}
