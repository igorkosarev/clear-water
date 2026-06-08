import { useMemo, Fragment } from 'react'
import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Droplets, CheckCircle, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FilterUnit } from '@/components/filter/FilterUnit'
import { FILTER_TYPE_CONFIG } from '@/components/filter/FilterTypes'
import type { FilterType } from '@/components/filter/FilterTypes'
import type { ContaminantId, Contaminant } from '@/types'
import contaminantsData from '@/data/contaminants.json'

// ── Layout constants ──────────────────────────────────────────────────────────

const HPIPE_W = 48   // horizontal pipe stub width px
const HPIPE_H = 16   // horizontal pipe tube height px (pipe "diameter")
const UTURN_H = 40   // U-turn connector total height px
const PARTICLE_PX = 5
const HALF_PX = 2    // floor(PARTICLE_PX / 2)

// ── Deterministic particle slots ──────────────────────────────────────────────

// Horizontal pipe: [delay(s), duration(s), yOffset from centre(px)]
const HSLOTS: readonly [number, number, number][] = [
  [0.0, 1.6, -2],
  [0.7, 1.9,  2],
  [1.3, 2.0, -3],
  [1.9, 1.7,  3],
  [0.4, 1.8,  0],
  [1.0, 2.1, -2],
  [1.6, 1.6,  2],
  [0.2, 2.0,  0],
]

// U-turn pipe: [delay(s), duration(s), xOffset from base(px)]
const VSLOTS: readonly [number, number, number][] = [
  [0.0, 1.4, -3],
  [0.8, 1.6,  2],
  [1.5, 1.5, -2],
  [0.4, 1.7,  3],
  [1.2, 1.4,  0],
  [0.3, 1.6, -2],
  [0.9, 1.5,  3],
  [1.6, 1.4,  0],
]

// ── Particle type helpers ─────────────────────────────────────────────────────

interface HP { id: string; delay: number; dur: number; yOff: number; color: string }
interface VP { id: string; delay: number; dur: number; xOff: number; color: string }

function hParticles(cs: Contaminant[]): HP[] {
  return cs.map((c, j) => {
    const [delay, dur, yOff] = HSLOTS[j % HSLOTS.length]
    return { id: `${c.id}-h`, delay, dur, yOff, color: c.color }
  })
}

function vParticles(cs: Contaminant[]): VP[] {
  return cs.map((c, j) => {
    const [delay, dur, xOff] = VSLOTS[j % VSLOTS.length]
    return { id: `${c.id}-v`, delay, dur, xOff, color: c.color }
  })
}

// ── HorizontalPipe ────────────────────────────────────────────────────────────

function HorizontalPipe({
  direction,
  contaminants,
}: {
  direction: 'ltr' | 'rtl'
  contaminants: Contaminant[]
}) {
  const particles = useMemo(() => hParticles(contaminants), [contaminants])
  const ltr = direction === 'ltr'
  const xStart = ltr ? -PARTICLE_PX : HPIPE_W + PARTICLE_PX
  const xEnd   = ltr ? HPIPE_W + PARTICLE_PX : -PARTICLE_PX

  return (
    <div
      className="flex-shrink-0 relative"
      style={{ width: HPIPE_W, height: HPIPE_H, overflow: 'visible' }}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          border: '1px solid #334155',
          borderRadius: 4,
        }}
      />
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: PARTICLE_PX,
            height: PARTICLE_PX,
            left: 0,
            top: `calc(50% + ${p.yOff}px - ${HALF_PX}px)`,
            backgroundColor: p.color,
            boxShadow: `0 0 5px ${p.color}`,
          }}
          animate={{ x: [xStart, xEnd] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear' as const }}
        />
      ))}
    </div>
  )
}

// ── UTurnConnector ────────────────────────────────────────────────────────────

function UTurnConnector({
  side,
  contaminants,
}: {
  side: 'left' | 'right'
  contaminants: Contaminant[]
}) {
  const particles = useMemo(() => vParticles(contaminants), [contaminants])
  const radius = UTURN_H / 2
  // Particles cluster toward the inner wall of the bend
  const xBase = side === 'right' ? HPIPE_W * 0.28 : HPIPE_W * 0.72

  const tubeStyle: CSSProperties =
    side === 'right'
      ? {
          background: 'linear-gradient(to right, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          borderTop: '1px solid #334155',
          borderRight: '1px solid #334155',
          borderBottom: '1px solid #334155',
          borderLeft: 'none',
          borderRadius: `0 ${radius}px ${radius}px 0`,
        }
      : {
          background: 'linear-gradient(to right, #1e293b 0%, #1e293b 50%, #0f172a 100%)',
          borderTop: '1px solid #334155',
          borderLeft: '1px solid #334155',
          borderBottom: '1px solid #334155',
          borderRight: 'none',
          borderRadius: `${radius}px 0 0 ${radius}px`,
        }

  return (
    <div className={`w-full flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div
        className="relative overflow-hidden"
        style={{ width: HPIPE_W, height: UTURN_H }}
        aria-hidden
      >
        <div className="absolute inset-0" style={tubeStyle} />
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: PARTICLE_PX,
              height: PARTICLE_PX,
              left: xBase + p.xOff - HALF_PX,
              top: 0,
              backgroundColor: p.color,
              boxShadow: `0 0 5px ${p.color}`,
            }}
            animate={{ y: [-PARTICLE_PX, UTURN_H + PARTICLE_PX] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear' as const }}
          />
        ))}
      </div>
    </div>
  )
}

// ── ContaminantChip ───────────────────────────────────────────────────────────

function ContaminantChip({ contaminant }: { contaminant: Contaminant }) {
  const { t } = useTranslation()
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${contaminant.color}22`,
        color: contaminant.color,
        border: `1px solid ${contaminant.color}44`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: contaminant.color }} />
      {t(contaminant.nameKey, { defaultValue: contaminant.id.replace(/_/g, ' ') })}
    </span>
  )
}

// ── SimulationCanvas ──────────────────────────────────────────────────────────

interface SimulationCanvasProps {
  filters: FilterType[]
  inputContaminants: ContaminantId[]
}

export function SimulationCanvas({ filters, inputContaminants }: SimulationCanvasProps) {
  const contaminantMap = useMemo(() => {
    const m = new Map<ContaminantId, Contaminant>()
    ;(contaminantsData as Contaminant[]).forEach(c => m.set(c.id, c))
    return m
  }, [])

  // stageContaminants[i] = IDs entering filter i; [filters.length] = final output
  const stageContaminants = useMemo<ContaminantId[][]>(() => {
    const stages: ContaminantId[][] = [inputContaminants]
    let current = [...inputContaminants]
    for (const f of filters) {
      current = current.filter(id => !FILTER_TYPE_CONFIG[f].removes.includes(id))
      stages.push(current)
    }
    return stages
  }, [filters, inputContaminants])

  const stageObjects = useMemo<Contaminant[][]>(
    () =>
      stageContaminants.map(ids =>
        ids.map(id => contaminantMap.get(id)).filter((c): c is Contaminant => c !== undefined)
      ),
    [stageContaminants, contaminantMap]
  )

  const remainingObjects = stageObjects[stageObjects.length - 1]
  const allClear = remainingObjects.length === 0

  return (
    <div className="flex flex-col w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
      {/* ── Inlet ── */}
      <div className="w-full rounded-2xl bg-slate-900/80 border border-slate-800 p-4 mb-2">
        <div className="flex items-center gap-2 mb-3">
          <Droplets size={14} className="text-blue-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Water In</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {stageObjects[0].map(c => <ContaminantChip key={c.id} contaminant={c} />)}
        </div>
      </div>

      {/* ── Snake filter layout ── */}
      {filters.map((f, i) => {
        const isLTR = i % 2 === 0
        const dir = isLTR ? 'ltr' as const : 'rtl' as const
        // LTR: water enters left, exits right
        // RTL: water enters right (from U-turn above), exits left
        const leftPipe  = isLTR ? stageObjects[i]     : stageObjects[i + 1]
        const rightPipe = isLTR ? stageObjects[i + 1] : stageObjects[i]

        return (
          <Fragment key={i}>
            {/* Filter row: [H-pipe] [FilterUnit] [H-pipe] */}
            <div className="flex items-center w-full">
              <HorizontalPipe direction={dir} contaminants={leftPipe} />
              <FilterUnit
                type={f}
                inputContaminants={stageContaminants[i]}
                outputContaminants={stageContaminants[i + 1]}
                animated
              />
              <HorizontalPipe direction={dir} contaminants={rightPipe} />
            </div>

            {/* U-turn between rows (skip after last filter) */}
            {i < filters.length - 1 && (
              <UTurnConnector
                side={isLTR ? 'right' : 'left'}
                contaminants={stageObjects[i + 1]}
              />
            )}
          </Fragment>
        )
      })}

      {/* ── Outlet ── */}
      <div
        className="w-full rounded-2xl border p-4 mt-2"
        style={{
          backgroundColor: allClear ? 'rgba(5,46,22,0.35)' : 'rgba(69,26,3,0.35)',
          borderColor: allClear ? 'rgba(34,197,94,0.35)' : 'rgba(245,158,11,0.35)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          {allClear ? (
            <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
          )}
          <span className={`text-xs font-semibold uppercase tracking-wider ${allClear ? 'text-emerald-400' : 'text-amber-400'}`}>
            {allClear ? 'Clean Water' : 'Partially Filtered'}
          </span>
        </div>
        {allClear ? (
          <p className="text-xs text-emerald-500/60">All detected contaminants removed</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {remainingObjects.map(c => <ContaminantChip key={c.id} contaminant={c} />)}
          </div>
        )}
      </div>
    </div>
  )
}
