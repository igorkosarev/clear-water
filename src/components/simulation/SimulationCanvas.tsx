import { useRef, useEffect, useMemo } from 'react'
import { FILTER_TYPE_CONFIG } from '@/components/filter/FilterTypes'
import type { FilterType } from '@/components/filter/FilterTypes'
import type { ContaminantId, Contaminant } from '@/types'
import contaminantsData from '@/data/contaminants.json'

// ─── Bezier math ──────────────────────────────────────────────────────────────

function b1(a: number, b: number, c: number, d: number, t: number) {
  const u = 1 - t
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
}

function bezLen(
  x0: number, y0: number, cx1: number, cy1: number,
  cx2: number, cy2: number, x1: number, y1: number, n = 24,
) {
  let l = 0, px = x0, py = y0
  for (let i = 1; i <= n; i++) {
    const t = i / n
    const nx = b1(x0, cx1, cx2, x1, t)
    const ny = b1(y0, cy1, cy2, y1, t)
    l += Math.hypot(nx - px, ny - py)
    px = nx; py = ny
  }
  return l
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Seg =
  | { k: 'L'; x0: number; y0: number; x1: number; y1: number }
  | { k: 'B'; x0: number; y0: number; cx1: number; cy1: number; cx2: number; cy2: number; x1: number; y1: number }

interface PSeg { seg: Seg; start: number; len: number; fi: number | null }
interface Pt { x: number; y: number }

interface Particle {
  cid: ContaminantId
  color: string
  dist: number
  speed: number
  alpha: number
  absorbing: boolean
  absorbT: number
  absorbPos: Pt
  absorbAt: number
}

// ─── Layout constants ─────────────────────────────────────────────────────────

const FH    = 64    // filter height px
const GAP   = 50    // gap between filter rows px
const PX    = 52    // horizontal port inset from canvas edges
const BULGE = 48    // bezier U-turn control point outward offset
const WBH   = 104   // "Water In" box height
const WBM_TOP = 28   // Water In box → first filter
const WBM_BOT = 72   // last filter → Clean Water box
const CBH   = 80    // "Clean Water" box height
const PW    = 16     // pipe stroke width
const PR    = 4     // particle radius
const GLOW  = 8     // particle glow blur
const N_PAR = 3     // particles per contaminant
const SPD   = 72    // base particle speed px/s

// ─── Layout ───────────────────────────────────────────────────────────────────

interface Row { x: number; y: number; w: number; h: number; ft: FilterType; ltr: boolean; cy: number }

interface Layout {
  rows: Row[]
  cbY: number
  ch: number
  cw: number
}

function computeLayout(cw: number, filters: FilterType[]): Layout {
  const lx = PX, rx = cw - PX
  const rows: Row[] = filters.map((ft, i) => {
    const y = WBH + WBM_TOP + i * (FH + GAP)
    return { x: lx, y, w: rx - lx, h: FH, ft, ltr: i % 2 === 0, cy: y + FH / 2 }
  })
  const lr = rows[rows.length - 1]
  const cbY = lr.y + FH + WBM_BOT
  return { rows, cbY, ch: cbY + CBH + 20, cw }
}

// ─── Path ─────────────────────────────────────────────────────────────────────

function buildPath(L: Layout): PSeg[] {
  const { rows, cbY, cw } = L
  const lx = PX, rx = cw - PX, cx = cw / 2
  const segs: PSeg[] = []
  let cum = 0

  function add(seg: Seg, fi: number | null) {
    const len = seg.k === 'L'
      ? Math.hypot(seg.x1 - seg.x0, seg.y1 - seg.y0)
      : bezLen(seg.x0, seg.y0, seg.cx1, seg.cy1, seg.cx2, seg.cy2, seg.x1, seg.y1)
    segs.push({ seg, start: cum, len, fi })
    cum += len
  }

  // Entry: (1) straight down from under the Water In box at centre,
  //        (2) horizontal run across to the first filter's port side,
  //        (3) arc (U-bend, bulging away from the housing) into the port.
  const r0 = rows[0]
  const ex0 = r0.ltr ? lx : rx               // first filter input port
  const entryRunY = WBH + (r0.y - WBH) * 0.5 // horizontal run, mid-gap below the box
  const eBulge = r0.ltr ? -BULGE : BULGE     // bulge outward, away from the filter
  add({ k: 'L', x0: cx, y0: WBH - 2, x1: cx, y1: entryRunY }, null)   // 1. down
  add({ k: 'L', x0: cx, y0: entryRunY, x1: ex0, y1: entryRunY }, null) // 2. across to port side
  add({                                                                // 3. arc into the port
    k: 'B',
    x0: ex0, y0: entryRunY,
    cx1: ex0 + eBulge, cy1: entryRunY,
    cx2: ex0 + eBulge, cy2: r0.cy,
    x1: ex0, y1: r0.cy,
  }, null)

  // Filter rows + U-turns
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const x0 = r.ltr ? lx : rx
    const x1 = r.ltr ? rx : lx
    // Horizontal through filter
    add({ k: 'L', x0, y0: r.cy, x1, y1: r.cy }, i)

    if (i < rows.length - 1) {
      const rn = rows[i + 1]
      const nx = rn.ltr ? lx : rx
      const bulge = r.ltr ? BULGE : -BULGE
      // Cubic bezier U-turn
      add({
        k: 'B',
        x0: x1, y0: r.cy,
        cx1: x1 + bulge, cy1: r.cy,
        cx2: nx + bulge, cy2: rn.cy,
        x1: nx, y1: rn.cy,
      }, null)
    }
  }

  // Exit (mirror of entry): (1) arc (U-bend, bulging away from the housing) out of
  // the last filter's port, (2) horizontal run back to centre — its direction
  // depends on the filter count (port side flips with parity), (3) straight down
  // into the Clean Water box.
  const rl = rows[rows.length - 1]
  const xe = rl.ltr ? rx : lx                       // last filter output port
  const exitRunY = (rl.y + FH) + (cbY - (rl.y + FH)) * 0.5 // mid-gap above the box
  const xBulge = rl.ltr ? BULGE : -BULGE            // bulge outward, away from the filter
  add({                                             // 1. arc out of the port
    k: 'B',
    x0: xe, y0: rl.cy,
    cx1: xe + xBulge, cy1: rl.cy,
    cx2: xe + xBulge, cy2: exitRunY,
    x1: xe, y1: exitRunY,
  }, null)
  add({ k: 'L', x0: xe, y0: exitRunY, x1: cx, y1: exitRunY }, null) // 2. across to centre
  add({ k: 'L', x0: cx, y0: exitRunY, x1: cx, y1: cbY + 2 }, null)  // 3. down into the box

  return segs
}

function ptAt(segs: PSeg[], dist: number): Pt {
  let rem = dist
  for (const s of segs) {
    if (rem <= s.len) {
      const t = s.len > 0 ? rem / s.len : 0
      const { seg } = s
      if (seg.k === 'L') {
        return { x: seg.x0 + (seg.x1 - seg.x0) * t, y: seg.y0 + (seg.y1 - seg.y0) * t }
      }
      return { x: b1(seg.x0, seg.cx1, seg.cx2, seg.x1, t), y: b1(seg.y0, seg.cy1, seg.cy2, seg.y1, t) }
    }
    rem -= s.len
  }
  const last = segs[segs.length - 1].seg
  return last.k === 'L' ? { x: last.x1, y: last.y1 } : { x: last.x1, y: last.y1 }
}

function pathLen(segs: PSeg[]): number {
  const last = segs[segs.length - 1]
  return last.start + last.len
}

function getAbsorbAt(segs: PSeg[], cid: ContaminantId, filters: FilterType[]): number {
  for (let i = 0; i < filters.length; i++) {
    if (FILTER_TYPE_CONFIG[filters[i]].removes.includes(cid)) {
      const fs = segs.find(s => s.fi === i)
      if (fs) return fs.start + fs.len * 0.55
    }
  }
  return pathLen(segs) + 1 // not absorbed — flows to end
}

// ─── Particles ────────────────────────────────────────────────────────────────

function makeParticle(
  c: Contaminant, j: number,
  segs: PSeg[], filters: FilterType[], tl: number,
): Particle {
  const absorbAt = getAbsorbAt(segs, c.id, filters)
  const maxDist = Math.min(tl * 0.33, absorbAt * 0.75)
  return {
    cid: c.id, color: c.color,
    dist: (j / N_PAR) * maxDist,
    speed: SPD * (0.75 + Math.random() * 0.5),
    alpha: 0.92,
    absorbing: false, absorbT: 0,
    absorbPos: { x: 0, y: 0 },
    absorbAt,
  }
}

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function drawPipes(ctx: CanvasRenderingContext2D, segs: PSeg[]) {
  // Outer shadow pipe
  ctx.save()
  ctx.strokeStyle = '#0d1f33'
  ctx.lineWidth = PW + 4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const { seg } of segs) {
    ctx.beginPath()
    if (seg.k === 'L') { ctx.moveTo(seg.x0, seg.y0); ctx.lineTo(seg.x1, seg.y1) }
    else { ctx.moveTo(seg.x0, seg.y0); ctx.bezierCurveTo(seg.cx1, seg.cy1, seg.cx2, seg.cy2, seg.x1, seg.y1) }
    ctx.stroke()
  }
  // Inner pipe
  ctx.strokeStyle = '#1e3a5f'
  ctx.lineWidth = PW
  for (const { seg } of segs) {
    ctx.beginPath()
    if (seg.k === 'L') { ctx.moveTo(seg.x0, seg.y0); ctx.lineTo(seg.x1, seg.y1) }
    else { ctx.moveTo(seg.x0, seg.y0); ctx.bezierCurveTo(seg.cx1, seg.cy1, seg.cx2, seg.cy2, seg.x1, seg.y1) }
    ctx.stroke()
  }
  ctx.restore()
}

const SYMBOLS: Record<FilterType, string> = {
  sediment: '≡', activated_carbon: '⚡', biosand: '⊟',
  ceramic: '◎', uv: '☀', ro: '≋', slow_sand: '∿',
  boiling: '△', chlorination: '⊕', booster_pump: '⟳',
  hollow_fiber: '⊘', distillation: '⌇', ion_exchange: '⇌',
  water_softening: '◈', sediment_filtration: '⊞',
}

function drawPump(ctx: CanvasRenderingContext2D, row: Row) {
  const pcx = row.x + row.w / 2
  const pcy = row.cy
  const cfg = FILTER_TYPE_CONFIG['booster_pump']
  const R = 30  // outer radius
  const Ri = 20 // inner radius

  // Outer ring glow
  ctx.save()
  ctx.shadowColor = cfg.color + '70'
  ctx.shadowBlur = 20
  ctx.beginPath(); ctx.arc(pcx, pcy, R, 0, Math.PI * 2)
  ctx.fillStyle = cfg.color + '18'
  ctx.fill()
  ctx.strokeStyle = cfg.color + '80'
  ctx.lineWidth = 2.5
  ctx.stroke()
  ctx.restore()

  // Inner circle
  ctx.save()
  ctx.beginPath(); ctx.arc(pcx, pcy, Ri, 0, Math.PI * 2)
  ctx.fillStyle = cfg.color + '30'
  ctx.fill()
  ctx.strokeStyle = cfg.color + '55'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()

  // Impeller blades (3 lines at 0°, 120°, 240°)
  ctx.save()
  ctx.strokeStyle = cfg.color + 'cc'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  for (let a = 0; a < 3; a++) {
    const angle = (a * Math.PI * 2) / 3
    ctx.beginPath()
    ctx.moveTo(pcx, pcy)
    ctx.lineTo(pcx + Math.cos(angle) * (Ri - 4), pcy + Math.sin(angle) * (Ri - 4))
    ctx.stroke()
  }
  ctx.restore()

  // Label below
  ctx.save()
  ctx.fillStyle = cfg.color + 'bb'
  ctx.font = '600 10px system-ui'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('PUMP', pcx, pcy + R + 4)
  ctx.restore()
}

function drawFilter(ctx: CanvasRenderingContext2D, row: Row, removed: Contaminant[]) {
  const { x, y, w, h, ft, ltr } = row
  if (ft === 'booster_pump') { drawPump(ctx, row); return }
  const cfg = FILTER_TYPE_CONFIG[ft]
  const r = 32, capW = 70

  // Glow
  ctx.save()
  ctx.shadowColor = cfg.color + '50'
  ctx.shadowBlur = 20
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r)
  ctx.fillStyle = cfg.color + '18'
  ctx.fill()
  ctx.restore()

  // Housing border
  ctx.save()
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r)
  ctx.strokeStyle = cfg.color + '60'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()

  // Left cap
  ctx.save()
  ctx.beginPath(); ctx.roundRect(x, y, capW, h, [r, 0, 0, r])
  ctx.fillStyle = cfg.color + '28'
  ctx.fill()
  ctx.strokeStyle = cfg.color + '40'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()

  // Right end cap
  ctx.save()
  ctx.beginPath(); ctx.roundRect(x + w - 18, y, 18, h, [0, r, r, 0])
  ctx.fillStyle = cfg.color + '14'
  ctx.fill()
  ctx.restore()

  // Icon (top half of cap)
  ctx.save()
  ctx.fillStyle = cfg.color
  ctx.font = '15px system-ui'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(SYMBOLS[ft] ?? '◆', x + capW / 2, y + h / 2 - (removed.length > 0 ? 12 : 4))
  ctx.restore()

  // Removed contaminant dots — below icon inside cap
  if (removed.length > 0) {
    const dotR = 4
    const maxPerRow = 4
    const rowCount = Math.ceil(removed.length / maxPerRow)
    const dotSpacing = Math.min(12, (capW - 16) / Math.min(removed.length, maxPerRow))
    removed.forEach((c, i) => {
      const col = i % maxPerRow
      const row = Math.floor(i / maxPerRow)
      const rowW = Math.min(removed.length - row * maxPerRow, maxPerRow) * dotSpacing
      const dotX = x + capW / 2 - rowW / 2 + col * dotSpacing + dotSpacing / 2
      const dotY = y + h / 2 + 4 + row * (dotR * 2 + 3)
      ctx.save()
      ctx.beginPath(); ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2)
      ctx.fillStyle = c.color
      ctx.shadowColor = c.color + 'bb'
      ctx.shadowBlur = 6
      ctx.fill()
      ctx.restore()
    })
    void rowCount // suppress unused warning
  }

  // Label
  ctx.save()
  ctx.fillStyle = '#dde6f0'
  ctx.font = '600 13px system-ui'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(cfg.label, x + capW + 10, y + h / 2)
  ctx.restore()

  // Flow direction arrow
  const ax = x + capW + (w - capW) * 0.68
  const dir = ltr ? 1 : -1
  ctx.save()
  ctx.strokeStyle = cfg.color + '50'
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(ax - 7 * dir, y + h / 2); ctx.lineTo(ax + 7 * dir, y + h / 2)
  ctx.moveTo(ax + 3 * dir, y + h / 2 - 4); ctx.lineTo(ax + 7 * dir, y + h / 2); ctx.lineTo(ax + 3 * dir, y + h / 2 + 4)
  ctx.stroke()
  ctx.restore()
}

function drawWaterBox(ctx: CanvasRenderingContext2D, cw: number, conts: Contaminant[]) {
  const x = 16, y = 0, w = cw - 32, h = WBH, r = 12
  ctx.save()
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r)
  ctx.fillStyle = '#0b1526e8'
  ctx.fill()
  ctx.strokeStyle = '#1e3a5f'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.fillStyle = '#64748b'
  ctx.font = '600 11px system-ui'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('💧  WATER IN', x + 14, y + 10)
  ctx.restore()

  // Chips
  let chipX = x + 14, chipY = y + 30
  ctx.save()
  conts.forEach(c => {
    const lbl = c.id.replace(/_/g, ' ')
    ctx.font = '500 11px system-ui'
    const tw = ctx.measureText(lbl).width
    const cw2 = tw + 28, ch2 = 20
    if (chipX + cw2 > x + w - 14) { chipX = x + 14; chipY += 26 }
    ctx.beginPath(); ctx.roundRect(chipX, chipY, cw2, ch2, ch2 / 2)
    ctx.fillStyle = c.color + '22'; ctx.fill()
    ctx.strokeStyle = c.color + '44'; ctx.lineWidth = 1; ctx.stroke()
    ctx.beginPath(); ctx.arc(chipX + 10, chipY + ch2 / 2, 3.5, 0, Math.PI * 2)
    ctx.fillStyle = c.color; ctx.fill()
    ctx.fillStyle = c.color
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText(lbl, chipX + 18, chipY + ch2 / 2)
    chipX += cw2 + 6
  })
  ctx.restore()
}

function drawCleanBox(ctx: CanvasRenderingContext2D, cw: number, cbY: number, allClear: boolean) {
  const x = 16, w = cw - 32, r = 12
  ctx.save()
  ctx.beginPath(); ctx.roundRect(x, cbY, w, CBH, r)
  ctx.fillStyle = allClear ? 'rgba(5,46,22,0.55)' : 'rgba(69,26,3,0.45)'
  ctx.fill()
  ctx.strokeStyle = allClear ? 'rgba(34,197,94,0.45)' : 'rgba(245,158,11,0.45)'
  ctx.lineWidth = 1.5; ctx.stroke()
  ctx.restore()
  ctx.save()
  ctx.fillStyle = allClear ? '#4ade80' : '#fbbf24'
  ctx.font = '600 11px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'
  ctx.fillText(allClear ? '✓  CLEAN WATER' : '⚠  PARTIALLY FILTERED', x + 14, cbY + 10)
  ctx.fillStyle = allClear ? '#86efac70' : '#fbbf2470'
  ctx.font = '400 12px system-ui'
  ctx.fillText(allClear ? 'All contaminants removed' : 'Some contaminants remain', x + 14, cbY + 30)
  ctx.restore()
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface SimulationCanvasProps {
  filters: FilterType[]
  inputContaminants: ContaminantId[]
}

export function SimulationCanvas({ filters, inputContaminants }: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const lastTRef = useRef<number>(0)
  const stateRef = useRef<{ segs: PSeg[]; layout: Layout; particles: Particle[]; tl: number } | null>(null)

  const allConts = useMemo(
    () => (contaminantsData as Contaminant[]).filter(c => inputContaminants.includes(c.id)),
    [inputContaminants],
  )

  const stageConts = useMemo(() => {
    const stages: ContaminantId[][] = [inputContaminants]
    let cur = [...inputContaminants]
    for (const f of filters) {
      cur = cur.filter(id => !FILTER_TYPE_CONFIG[f].removes.includes(id))
      stages.push(cur)
    }
    return stages
  }, [filters, inputContaminants])

  const allClear = stageConts[stageConts.length - 1].length === 0

  // Live refs so rAF loop always reads current values without restarting
  const allContsRef = useRef(allConts)
  const stageContsRef = useRef(stageConts)
  const allClearRef = useRef(allClear)
  const filtersRef = useRef(filters)
  allContsRef.current = allConts
  stageContsRef.current = stageConts
  allClearRef.current = allClear
  filtersRef.current = filters

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function setup() {
      const dpr = window.devicePixelRatio || 1
      const cw = container!.clientWidth
      if (cw < 1) return
      const L = computeLayout(cw, filtersRef.current)
      const segs = buildPath(L)
      const tl = pathLen(segs)
      canvas!.width = cw * dpr
      canvas!.height = L.ch * dpr
      canvas!.style.width = `${cw}px`
      canvas!.style.height = `${L.ch}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      const particles = allContsRef.current.flatMap((c, _i) =>
        Array.from({ length: N_PAR }, (_, j) => makeParticle(c, j, segs, filtersRef.current, tl)),
      )
      stateRef.current = { segs, layout: L, particles, tl }
    }

    function frame(now: number) {
      const dt = Math.min((now - lastTRef.current) / 1000, 0.05)
      lastTRef.current = now
      const S = stateRef.current
      if (!S) { rafRef.current = requestAnimationFrame(frame); return }
      const { segs, layout, particles, tl } = S
      const { rows, cbY, ch, cw } = layout

      ctx!.clearRect(0, 0, cw, ch)
      drawPipes(ctx!, segs)
      rows.forEach((row, i) => {
        const removedIds = stageContsRef.current[i].filter(id => !stageContsRef.current[i + 1].includes(id))
        const removed = (contaminantsData as Contaminant[]).filter(c => removedIds.includes(c.id))
        drawFilter(ctx!, row, removed)
      })
      drawWaterBox(ctx!, cw, allContsRef.current)
      drawCleanBox(ctx!, cw, cbY, allClearRef.current)

      for (const p of particles) {
        if (p.absorbing) {
          p.absorbT += dt / 0.45
          if (p.absorbT >= 1) {
            const cont = allContsRef.current.find(c => c.id === p.cid)
            if (cont) Object.assign(p, { ...makeParticle(cont, 0, segs, filtersRef.current, tl), dist: Math.random() * Math.min(tl * 0.3, p.absorbAt * 0.7) })
            continue
          }
          const scale = 1 - p.absorbT
          ctx!.save()
          ctx!.globalAlpha = (1 - p.absorbT) * 0.9
          ctx!.shadowColor = p.color; ctx!.shadowBlur = 16 * scale
          ctx!.beginPath(); ctx!.arc(p.absorbPos.x, p.absorbPos.y, PR * 2.5 * scale, 0, Math.PI * 2)
          ctx!.fillStyle = p.color; ctx!.fill()
          ctx!.restore()
          continue
        }

        p.dist += p.speed * dt
        if (p.dist >= p.absorbAt && p.absorbAt <= tl) {
          p.absorbing = true; p.absorbT = 0
          p.absorbPos = ptAt(segs, Math.min(p.absorbAt, tl - 0.1))
          continue
        }
        if (p.dist >= tl) p.dist = 0

        const pos = ptAt(segs, Math.min(p.dist, tl))
        ctx!.save()
        ctx!.globalAlpha = p.alpha
        ctx!.shadowColor = p.color; ctx!.shadowBlur = GLOW
        ctx!.beginPath(); ctx!.arc(pos.x, pos.y, PR, 0, Math.PI * 2)
        ctx!.fillStyle = p.color; ctx!.fill()
        ctx!.restore()
      }

      rafRef.current = requestAnimationFrame(frame)
    }

    setup()
    const ro = new ResizeObserver(setup)
    ro.observe(container)
    lastTRef.current = performance.now()
    rafRef.current = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, []) // runs once; live data flows through refs

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  )
}
