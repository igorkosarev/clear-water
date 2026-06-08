import {
  Layers, Zap, Droplets, CircleDot, Sun, Waves, AlignJustify, Flame, FlaskConical, Gauge,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FilterType } from '@/types'

export type { FilterType }

export interface FilterTypeConfig {
  color: string      // hex accent colour
  label: string
  Icon: LucideIcon
  removes: string[]  // canonical contaminant IDs this type removes
}

export const FILTER_TYPE_CONFIG: Record<FilterType, FilterTypeConfig> = {
  sediment: {
    color: '#a8a29e',
    label: 'Sediment Filter',
    Icon: Layers,
    removes: ['turbidity'],
  },
  activated_carbon: {
    color: '#475569',
    label: 'Activated Carbon',
    Icon: Zap,
    removes: ['chlorine', 'heavy_metals'],
  },
  biosand: {
    color: '#92400e',
    label: 'Biosand Filter',
    Icon: Droplets,
    removes: ['bacteria', 'protozoa', 'turbidity'],
  },
  ceramic: {
    color: '#d97706',
    label: 'Ceramic Filter',
    Icon: CircleDot,
    removes: ['bacteria', 'protozoa', 'turbidity'],
  },
  uv: {
    color: '#a855f7',
    label: 'UV Disinfection',
    Icon: Sun,
    removes: ['bacteria', 'viruses', 'protozoa'],
  },
  ro: {
    color: '#0284c7',
    label: 'Reverse Osmosis',
    Icon: Waves,
    removes: ['bacteria', 'viruses', 'protozoa', 'heavy_metals', 'nitrates', 'fluoride'],
  },
  slow_sand: {
    color: '#78716c',
    label: 'Slow Sand Filter',
    Icon: AlignJustify,
    removes: ['bacteria', 'protozoa', 'turbidity'],
  },
  boiling: {
    color: '#ef4444',
    label: 'Boiling',
    Icon: Flame,
    removes: ['bacteria', 'viruses', 'protozoa'],
  },
  chlorination: {
    color: '#4ade80',
    label: 'Chlorination',
    Icon: FlaskConical,
    removes: ['bacteria', 'viruses'],
  },
  booster_pump: {
    color: '#8b5cf6',
    label: 'Booster Pump',
    Icon: Gauge,
    removes: [],
  },
}
