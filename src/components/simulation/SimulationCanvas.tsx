import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Droplets, CheckCircle, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FilterUnit } from '@/components/filter/FilterUnit'
import { FILTER_TYPE_CONFIG } from '@/components/filter/FilterTypes'
import type { FilterType } from '@/components/filter/FilterTypes'
import type { ContaminantId, Contaminant } from '@/types'
import contaminantsData from '@/data/contaminants.json'

// ── Layout constants ──────────────────────────────────────────────────────────

const PIPE_W = 40        // pipe visual width in px
const PIPE_H = 52        // pipe segment height in px
const PARTICLE_PX = 5   // particle diameter in px
const HALF_PX = PARTICLE_PX >> 1

// ── Deterministic particle slot definitions ───────────────────────────────────
// Each slot: [xOffset from pipe centre (px), delay (s), duration (s)]
// 8 slots — for up to 8 contaminants, 2 particles each (slot i and slot i+4)

type Slot = readonly [number, number, number]

const SLOTS: Slot[] = [
  [-9, 0.0, 2.2],
  [ 7, 1.5, 2.7],
  [ 8, 0.7, 2.9],
  [-4, 2.1, 2.1],
  [-3, 1.3, 2.5],
  [ 6, 0.2, 3.0],
  [ 4, 1.9, 2.3],
  [-8, 0.9, 2.8],
]

const SLOTS_LEN = SLOTS.length   // 8
const HALF_SLOTS = SLOTS_LEN >> 1  // 4

// ── Local components ──────────────────────────────────────────────────────────

interface Particle {
  id: string
  x: number
  delay: number
  dur: number
  color: string
}

function buildParticles(contaminants: Contaminant[]): Particle[] {
  return contaminants.flatMap((c, j) => {
    const [x0, delay0, dur0] = SLOTS[j % SLOTS_LEN]
    const [x1, delay1, dur1] = SLOTS[(j + HALF_SLOTS) % SLOTS_LEN]
    return [
      { id: `${c.id}-a`, x: x0, delay: delay0, dur: dur0, color: c.color },
      { id: `${c.id}-b`, x: x1, delay: delay1, dur: dur1, color: c.color },
    ]
  })
}

function PipeSegment({ contaminants }: { contaminants: Contaminant[] }) {
  const particles = useMemo(() => buildParticles(contaminants), [contaminants])

  return (
    <div
      className="relative mx-auto flex-shrink-0"
      style={{ width: PIPE_W, height: PIPE_H, overflow: 'visible' }}
      aria-hidden
    >
      {/* Tube visual */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          border: '1px solid #334155',
          borderRadius: 4,
        }}
      />
      {/* Flowing particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: PARTICLE_PX,
            height: PARTICLE_PX,
            left: `calc(50% + ${p.x}px - ${HALF_PX}px)`,
            top: 0,
            backgroundColor: p.color,
            boxShadow: `0 0 5px ${p.color}`,
          }}
          animate={{ y: [-PARTICLE_PX, PIPE_H + PARTICLE_PX] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear' as const }}
        />
      ))}
    </div>
  )
}

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
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: contaminant.color }}
      />
      {t(contaminant.nameKey, { defaultValue: contaminant.id.replace(/_/g, ' ') })}
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

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

  // stageContaminants[i] = contaminant IDs entering filter i
  const stageContaminants = useMemo<ContaminantId[][]>(() => {
    const stages: ContaminantId[][] = [inputContaminants]
    let current = [...inputContaminants]
    for (const f of filters) {
      current = current.filter(id => !FILTER_TYPE_CONFIG[f].removes.includes(id))
      stages.push(current)
    }
    return stages
  }, [filters, inputContaminants])

  // Resolve contaminant objects for each stage (stable reference when stageContaminants is stable)
  const stageObjects = useMemo<Contaminant[][]>(
    () =>
      stageContaminants.map(ids =>
        ids.map(id => contaminantMap.get(id)).filter((c): c is Contaminant => c !== undefined)
      ),
    [stageContaminants, contaminantMap]
  )

  const inputObjects = stageObjects[0]
  const remainingObjects = stageObjects[stageObjects.length - 1]
  const allClear = remainingObjects.length === 0

  return (
    <div className="flex flex-col items-center w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
      {/* ── Inlet ── */}
      <div className="w-full rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Droplets size={14} className="text-blue-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Water In
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {inputObjects.map(c => (
            <ContaminantChip key={c.id} contaminant={c} />
          ))}
        </div>
      </div>

      {/* ── Filter stages with animated pipes ── */}
      {filters.map((f, i) => (
        <div key={i} className="w-full flex flex-col items-center">
          <PipeSegment contaminants={stageObjects[i]} />
          <FilterUnit
            type={f}
            inputContaminants={stageContaminants[i]}
            outputContaminants={stageContaminants[i + 1]}
            animated
          />
        </div>
      ))}

      {/* ── Final pipe after last filter ── */}
      <PipeSegment contaminants={remainingObjects} />

      {/* ── Outlet ── */}
      <div
        className="w-full rounded-2xl border p-4"
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
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              allClear ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {allClear ? 'Clean Water' : 'Partially Filtered'}
          </span>
        </div>
        {allClear ? (
          <p className="text-xs text-emerald-500/60">All detected contaminants removed</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {remainingObjects.map(c => (
              <ContaminantChip key={c.id} contaminant={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
