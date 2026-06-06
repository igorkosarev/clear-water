import { useRef, useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FILTER_VISUAL_CONFIG } from '@/components/filter/FilterTypes'
import { FilterUnit } from '@/components/filter/FilterUnit'
import type { FilterType } from '@/components/filter/FilterTypes'
import type { ContaminantId, Contaminant } from '@/types'
import contaminantsData from '@/data/contaminants.json'

const PARTICLE_R = 7          // particle radius in px
const PARTICLE_D = PARTICLE_R * 2
const ANIM_DURATION = 3.8     // seconds to traverse the full track
const FADE_DURATION = 0.35    // seconds for the "pop" fade at removal
const REPEAT_DELAY = 0.7      // seconds between loops

interface SimulationCanvasProps {
  filters: FilterType[]
  inputContaminants: ContaminantId[]
}

interface ParticleData {
  id: ContaminantId
  contaminant: Contaminant
  removalIndex: number   // -1 = passes through
  staggerDelay: number
}

export function SimulationCanvas({ filters, inputContaminants }: SimulationCanvasProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [trackWidth, setTrackWidth] = useState(0)

  // Measure track width; update on resize
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      setTrackWidth(entries[0].contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const contaminantMap = useMemo(() => {
    const m = new Map<string, Contaminant>()
    ;(contaminantsData as Contaminant[]).forEach(c => m.set(c.id, c))
    return m
  }, [])

  // Propagate contaminant state through filter chain
  const stageContaminants = useMemo<ContaminantId[][]>(() => {
    const stages: ContaminantId[][] = [inputContaminants]
    let current = [...inputContaminants]
    for (const f of filters) {
      current = current.filter(id => !FILTER_VISUAL_CONFIG[f].removes.includes(id))
      stages.push(current)
    }
    return stages
  }, [filters, inputContaminants])

  const remainingContaminants = stageContaminants[stageContaminants.length - 1]
  const allClear = remainingContaminants.length === 0

  // Build particle data (only for known contaminants)
  const particles = useMemo<ParticleData[]>(() => {
    return inputContaminants
      .map((id, idx) => {
        const contaminant = contaminantMap.get(id)
        if (!contaminant) return null
        const removalIndex = filters.findIndex(f =>
          FILTER_VISUAL_CONFIG[f].removes.includes(id)
        )
        return {
          id,
          contaminant,
          removalIndex,
          staggerDelay: idx * 0.55,
        } satisfies ParticleData
      })
      .filter((p): p is ParticleData => p !== null)
  }, [inputContaminants, filters, contaminantMap])

  // X position of filter i on the track (center of filter zone)
  const filterXPositions = useMemo(
    () => filters.map((_, i) => Math.round(((i + 1) / (filters.length + 1)) * trackWidth)),
    [filters, trackWidth]
  )

  // Animate key: force particle remount when layout changes
  const animKey = `${filters.join('.')}-${trackWidth}`

  return (
    <div className="w-full rounded-xl bg-gradient-to-b from-white to-blue-50 border border-blue-100 overflow-x-auto">
      <div className="min-w-[360px] p-4 sm:p-6 space-y-5">

        {/* ── Filter chain ── */}
        <div className="flex items-end justify-around gap-3">
          {/* Input label */}
          <div className="flex flex-col items-center gap-1 text-xs text-slate-400 flex-shrink-0">
            <span className="text-xl">🚰</span>
            <span className="font-medium">Input</span>
          </div>

          {/* Filters with connectors */}
          <div className="flex items-center gap-2 flex-wrap justify-center flex-1">
            {filters.map((type, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && (
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {[0, 1, 2].map(j => (
                      <motion.div
                        key={j}
                        className="w-1.5 h-1.5 rounded-full bg-blue-300"
                        animate={{ opacity: [0.15, 1, 0.15] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.35 + j * 0.2,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>
                )}
                <FilterUnit
                  type={type}
                  inputContaminants={stageContaminants[i]}
                  outputContaminants={stageContaminants[i + 1]}
                  animated
                />
              </div>
            ))}
          </div>

          {/* Output label */}
          <div className="flex flex-col items-center gap-1 text-xs flex-shrink-0">
            <span className="text-xl">{allClear ? '✅' : '⚠️'}</span>
            <span className={`font-medium ${allClear ? 'text-green-600' : 'text-amber-600'}`}>
              {allClear ? 'Clean' : 'Partial'}
            </span>
          </div>
        </div>

        {/* ── Animated water track ── */}
        <div
          ref={trackRef}
          className="relative h-10 rounded-full bg-blue-100 border border-blue-200 overflow-hidden"
          aria-hidden
        >
          {/* Shimmer — flowing water illusion */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 0.3 }}
          />

          {/* Filter zone dividers */}
          {filterXPositions.map((xPx, i) => (
            <div
              key={i}
              className="absolute top-1 bottom-1 w-px bg-blue-300/70"
              style={{ left: xPx }}
            />
          ))}

          {/* Particles */}
          {trackWidth > 0 &&
            particles.map(p => {
              const removed = p.removalIndex !== -1
              const removalXPx = removed
                ? filterXPositions[p.removalIndex] ?? trackWidth
                : trackWidth + PARTICLE_D

              // Fraction of the track the particle travels (0–1) before removal / exit
              const travelFraction = Math.min(removalXPx / trackWidth, 1)

              // Proportional travel duration so velocity stays constant
              const travelDuration = ANIM_DURATION * travelFraction

              const xStart = -PARTICLE_R
              const xEnd = removalXPx - PARTICLE_R

              return (
                <motion.div
                  key={`${animKey}-${p.id}`}
                  className="absolute rounded-full"
                  style={{
                    width: PARTICLE_D,
                    height: PARTICLE_D,
                    top: `calc(50% - ${PARTICLE_R}px)`,
                    // Dynamic data-driven color — no Tailwind equivalent for arbitrary hex
                    backgroundColor: p.contaminant.color,
                    boxShadow: `0 0 7px 2px ${p.contaminant.color}66`,
                  }}
                  initial={{ x: xStart, opacity: 1, scale: 1 }}
                  animate={
                    removed
                      ? {
                          x: [xStart, xEnd, xEnd],
                          opacity: [1, 0.95, 0],
                          scale: [1, 1.45, 0],
                        }
                      : {
                          x: [xStart, xEnd],
                          opacity: [1, 0.85],
                          scale: [1, 1],
                        }
                  }
                  transition={
                    removed
                      ? {
                          duration: travelDuration + FADE_DURATION,
                          times: [
                            0,
                            travelDuration / (travelDuration + FADE_DURATION) - 0.005,
                            1,
                          ],
                          ease: 'linear',
                          repeat: Infinity,
                          repeatDelay: REPEAT_DELAY,
                          delay: p.staggerDelay,
                        }
                      : {
                          duration: travelDuration,
                          ease: 'linear',
                          repeat: Infinity,
                          repeatDelay: REPEAT_DELAY,
                          delay: p.staggerDelay,
                        }
                  }
                />
              )
            })}
        </div>

        {/* ── Legend ── */}
        {particles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {particles.map(p => {
              const isRemoved = !remainingContaminants.includes(p.id)
              return (
                <span
                  key={p.id}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-opacity duration-500 ${isRemoved ? 'opacity-40' : 'opacity-100'}`}
                  // Dynamic data-driven colors
                  style={{
                    backgroundColor: p.contaminant.color + '1a',
                    color: p.contaminant.color,
                    border: `1px solid ${p.contaminant.color}44`,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: p.contaminant.color }}
                  />
                  {p.id.replace('_', ' ')}
                  {isRemoved ? ' ✓' : ' ⚠'}
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
