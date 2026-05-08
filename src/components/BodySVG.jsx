const FRONT_MUSCLES = {
  chest: "M 108 118 C 102 112 118 105 135 108 L 148 155 C 132 158 112 150 108 138 Z M 192 118 C 198 112 182 105 165 108 L 152 155 C 168 158 188 150 192 138 Z",
  shoulders: "M 88 108 C 78 100 72 118 76 132 C 78 140 86 146 96 142 C 106 138 110 126 106 114 Z M 212 108 C 222 100 228 118 224 132 C 222 140 214 146 204 142 C 194 138 190 126 194 114 Z",
  biceps: "M 78 144 C 70 150 66 166 68 180 C 70 190 78 196 88 194 C 98 192 102 180 100 168 C 98 156 88 140 78 144 Z M 222 144 C 230 150 234 166 232 180 C 230 190 222 196 212 194 C 202 192 198 180 200 168 C 202 156 212 140 222 144 Z",
  forearms: "M 68 198 C 62 208 60 224 62 238 C 64 248 72 252 80 250 C 88 248 92 236 90 224 C 88 212 78 196 68 198 Z M 232 198 C 238 208 240 224 238 238 C 236 248 228 252 220 250 C 212 248 208 236 210 224 C 212 212 222 196 232 198 Z",
  abs: "M 138 160 L 162 160 L 160 182 L 140 182 Z M 137 186 L 151 186 L 150 206 L 138 206 Z M 149 186 L 163 186 L 162 206 L 150 206 Z M 136 210 L 150 210 L 149 228 L 137 228 Z M 150 210 L 164 210 L 163 228 L 151 228 Z",
  obliques: "M 118 168 C 110 174 106 190 108 202 C 110 212 118 216 126 212 C 134 208 136 194 134 182 C 132 170 126 164 118 168 Z M 182 168 C 190 174 194 190 192 202 C 190 212 182 216 174 212 C 166 208 164 194 166 182 C 168 170 174 164 182 168 Z",
  quads: "M 120 242 C 110 248 104 268 106 288 C 108 308 120 322 132 320 C 144 318 150 304 148 284 C 146 264 136 238 120 242 Z M 180 242 C 190 248 196 268 194 288 C 192 308 180 322 168 320 C 156 318 150 304 152 284 C 154 264 164 238 180 242 Z",
  calves: "M 118 332 C 110 338 106 356 110 372 C 113 384 122 390 130 386 C 138 382 140 368 138 354 C 136 340 126 328 118 332 Z M 182 332 C 190 338 194 356 190 372 C 187 384 178 390 170 386 C 162 382 160 368 162 354 C 164 340 174 328 182 332 Z",
  traps: "M 135 82 C 128 88 124 98 128 106 C 136 110 150 112 150 112 C 150 112 164 110 172 106 C 176 98 172 88 165 82 Z",
}

const BACK_MUSCLES = {
  traps: "M 130 82 C 120 88 114 100 118 112 C 128 118 150 122 150 122 C 150 122 172 118 182 112 C 186 100 180 88 170 82 Z",
  back: "M 112 122 C 102 130 98 150 102 168 C 106 182 118 188 132 184 C 146 180 150 165 150 150 Z M 188 122 C 198 130 202 150 198 168 C 194 182 182 188 168 184 C 154 180 150 165 150 150 Z",
  lats: "M 100 152 C 90 164 88 184 94 200 C 98 212 110 216 120 210 C 130 204 132 188 128 172 C 124 156 112 146 100 152 Z M 200 152 C 210 164 212 184 206 200 C 202 212 190 216 180 210 C 170 204 168 188 172 172 C 176 156 188 146 200 152 Z",
  lower_back: "M 130 214 C 122 220 120 234 122 246 C 124 256 132 262 142 260 C 152 258 156 246 154 234 C 152 222 144 210 130 214 Z M 170 214 C 178 220 180 234 178 246 C 176 256 168 262 158 260 C 148 258 144 246 146 234 C 148 222 156 210 170 214 Z",
  glutes: "M 116 252 C 106 260 102 278 106 294 C 110 308 122 314 134 308 C 146 302 150 286 146 270 C 142 254 128 246 116 252 Z M 184 252 C 194 260 198 278 194 294 C 190 308 178 314 166 308 C 154 302 150 286 154 270 C 158 254 172 246 184 252 Z",
  hamstrings: "M 118 314 C 108 322 104 342 108 360 C 112 374 124 380 134 374 C 144 368 146 352 142 336 C 138 320 128 308 118 314 Z M 182 314 C 192 322 196 342 192 360 C 188 374 176 380 166 374 C 156 368 154 352 158 336 C 162 320 172 308 182 314 Z",
  calves: "M 120 382 C 112 388 108 404 112 420 C 115 432 124 438 132 434 C 140 430 142 416 140 402 C 138 388 128 378 120 382 Z M 180 382 C 188 388 192 404 188 420 C 185 432 176 438 168 434 C 160 430 158 416 160 402 C 162 388 172 378 180 382 Z",
  triceps: "M 76 144 C 68 150 64 168 66 182 C 68 194 76 200 86 198 C 96 196 100 182 98 168 C 96 154 86 138 76 144 Z M 224 144 C 232 150 236 168 234 182 C 232 194 224 200 214 198 C 204 196 200 182 202 168 C 204 154 214 138 224 144 Z",
  shoulders: "M 88 108 C 78 100 72 118 76 132 C 78 140 86 146 96 142 C 106 138 110 126 106 114 Z M 212 108 C 222 100 228 118 224 132 C 222 140 214 146 204 142 C 194 138 190 126 194 114 Z",
}

const BACK_ONLY = ['back', 'lats', 'lower_back', 'hamstrings', 'glutes', 'triceps']
const FRONT_ONLY = ['chest', 'biceps', 'abs', 'quads', 'obliques', 'forearms']

function Silhouette() {
  return (
    <g opacity="0.12" fill="#ffffff">
      <ellipse cx="150" cy="52" rx="26" ry="30" />
      <rect x="138" y="78" width="24" height="20" rx="5" />
      <path d="M 102 98 C 90 102 76 114 74 138 L 70 242 L 230 242 L 226 138 C 224 114 210 102 198 98 Z" />
      <path d="M 74 135 C 62 140 54 162 56 202 C 57 228 62 252 66 260 L 86 260 L 92 202 L 100 148 Z" />
      <path d="M 226 135 C 238 140 246 162 244 202 C 243 228 238 252 234 260 L 214 260 L 208 202 L 200 148 Z" />
      <path d="M 112 240 L 104 395 L 140 395 L 150 240 Z" />
      <path d="M 188 240 L 196 395 L 160 395 L 150 240 Z" />
    </g>
  )
}

export default function BodySVG({ activeMuscles = [], size = 200, showBoth = false }) {
  const activeSet = new Set(activeMuscles)
  const hasBack = activeMuscles.some(m => BACK_ONLY.includes(m))
  const hasFront = activeMuscles.some(m => FRONT_ONLY.includes(m))

  const frontMuscles = Object.entries(FRONT_MUSCLES).map(([muscle, path]) => (
    <path key={muscle} d={path} fill={activeSet.has(muscle) ? '#e63946' : '#ffffff'} opacity={activeSet.has(muscle) ? 0.92 : 0.07} style={{ transition: 'all 0.3s' }} />
  ))

  const backMuscles = Object.entries(BACK_MUSCLES).map(([muscle, path]) => (
    <path key={muscle} d={path} fill={activeSet.has(muscle) ? '#e63946' : '#ffffff'} opacity={activeSet.has(muscle) ? 0.92 : 0.07} style={{ transition: 'all 0.3s' }} />
  ))

  const w = size
  const h = size * 1.5

  if (showBoth || (hasBack && hasFront)) {
    return (
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '9px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Face</p>
          <svg viewBox="0 0 300 450" width={w} height={h}><Silhouette />{frontMuscles}</svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '9px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Dos</p>
          <svg viewBox="0 0 300 450" width={w} height={h}><Silhouette />{backMuscles}</svg>
        </div>
      </div>
    )
  }

  if (hasBack) {
    return <svg viewBox="0 0 300 450" width={w} height={h} style={{ display: 'block' }}><Silhouette />{backMuscles}</svg>
  }

  return <svg viewBox="0 0 300 450" width={w} height={h} style={{ display: 'block' }}><Silhouette />{frontMuscles}</svg>
}
