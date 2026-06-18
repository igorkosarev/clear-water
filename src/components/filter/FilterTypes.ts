import {
  Layers, Zap, Droplets, CircleDot, Sun, Waves, AlignJustify, Flame, FlaskConical, Gauge,
  Wind, Thermometer,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FilterType } from '@/types'

export type { FilterType }

export interface FilterTypeConfig {
  color: string
  label: string
  Icon: LucideIcon
  removes: string[]
  micronRating: number | null  // µm pore size; null = non-mechanical filter
  prerequisites: {
    required: FilterType[]    // chain is invalid without these upstream
    recommended: FilterType[] // strongly advised upstream (soft warning if missing)
  }
}

export const FILTER_TYPE_CONFIG: Record<FilterType, FilterTypeConfig> = {
  sediment: {
    color: '#a8a29e',
    label: 'Sediment Filter',
    Icon: Layers,
    removes: ['turbidity', 'sediment'],
    micronRating: 5,
    prerequisites: { required: [], recommended: [] },
  },
  sediment_filtration: {
    color: '#a8a29e',
    label: 'Sediment Filtration',
    Icon: Layers,
    removes: ['turbidity', 'sediment'],
    micronRating: 5,
    prerequisites: { required: [], recommended: [] },
  },
  activated_carbon: {
    color: '#475569',
    label: 'Activated Carbon',
    Icon: Zap,
    removes: ['chlorine', 'pesticides', 'herbicides', 'vocs', 'petroleum'],
    micronRating: 1,
    prerequisites: { required: [], recommended: ['sediment'] },
  },
  biosand: {
    color: '#92400e',
    label: 'Biosand Filter',
    Icon: Droplets,
    removes: ['bacteria', 'protozoa', 'cyanobacteria', 'turbidity', 'sediment'],
    micronRating: 1,
    prerequisites: { required: [], recommended: [] },
  },
  ceramic: {
    color: '#d97706',
    label: 'Ceramic Filter',
    Icon: CircleDot,
    removes: ['bacteria', 'protozoa', 'cyanobacteria', 'turbidity', 'sediment'],
    micronRating: 0.2,
    prerequisites: { required: [], recommended: [] },
  },
  slow_sand: {
    color: '#78716c',
    label: 'Slow Sand Filter',
    Icon: AlignJustify,
    removes: ['bacteria', 'protozoa', 'turbidity', 'sediment'],
    micronRating: 0.1,
    prerequisites: { required: [], recommended: [] },
  },
  hollow_fiber: {
    color: '#38bdf8',
    label: 'Hollow Fiber UF',
    Icon: Wind,
    removes: ['bacteria', 'protozoa', 'cyanobacteria', 'turbidity', 'sediment', 'microplastics'],
    micronRating: 0.01,
    prerequisites: { required: ['sediment'], recommended: ['sediment'] },
  },
  ro: {
    color: '#0284c7',
    label: 'Reverse Osmosis',
    Icon: Waves,
    removes: [
      'bacteria', 'viruses', 'protozoa', 'cyanobacteria', 'cyanotoxins',
      'turbidity', 'sediment', 'microplastics',
      'lead', 'arsenic', 'mercury', 'cadmium', 'chromium_6', 'copper',
      'nitrates', 'nitrites', 'fluoride',
      'pesticides', 'herbicides', 'pfas',
      'hardness', 'iron', 'manganese', 'salinity',
      'pharmaceuticals', 'hormones', 'uranium',
    ],
    micronRating: 0.0001,
    prerequisites: {
      required: ['sediment'],
      recommended: ['sediment', 'activated_carbon'],
    },
  },
  uv: {
    color: '#a855f7',
    label: 'UV Disinfection',
    Icon: Sun,
    removes: ['bacteria', 'viruses', 'protozoa', 'cyanobacteria'],
    micronRating: null,
    prerequisites: {
      required: [],
      recommended: ['sediment', 'activated_carbon'],
    },
  },
  chlorination: {
    color: '#4ade80',
    label: 'Chlorination',
    Icon: FlaskConical,
    removes: ['bacteria', 'viruses'],
    micronRating: null,
    prerequisites: {
      required: [],
      recommended: ['sediment'],
    },
  },
  boiling: {
    color: '#ef4444',
    label: 'Boiling',
    Icon: Flame,
    removes: ['bacteria', 'viruses', 'protozoa', 'cyanobacteria'],
    micronRating: null,
    prerequisites: { required: [], recommended: [] },
  },
  ion_exchange: {
    color: '#f59e0b',
    label: 'Ion Exchange',
    Icon: Zap,
    removes: [
      'lead', 'arsenic', 'cadmium', 'chromium_6', 'copper',
      'nitrates', 'nitrites', 'fluoride',
      'hardness', 'iron', 'manganese', 'salinity', 'uranium',
    ],
    micronRating: null,
    prerequisites: { required: [], recommended: ['sediment'] },
  },
  water_softening: {
    color: '#60a5fa',
    label: 'Water Softening',
    Icon: Droplets,
    removes: ['hardness', 'iron', 'manganese'],
    micronRating: null,
    prerequisites: { required: [], recommended: ['sediment'] },
  },
  distillation: {
    color: '#94a3b8',
    label: 'Distillation',
    Icon: Thermometer,
    removes: [
      'bacteria', 'viruses', 'protozoa', 'cyanobacteria', 'cyanotoxins',
      'turbidity', 'sediment', 'microplastics',
      'lead', 'arsenic', 'cadmium', 'chromium_6', 'copper',
      'nitrates', 'nitrites', 'fluoride',
      'pfas', 'hardness', 'iron', 'manganese', 'salinity',
      'pharmaceuticals', 'hormones', 'uranium',
    ],
    micronRating: null,
    prerequisites: { required: [], recommended: [] },
  },
  booster_pump: {
    color: '#8b5cf6',
    label: 'Booster Pump',
    Icon: Gauge,
    removes: [],
    micronRating: null,
    prerequisites: { required: [], recommended: [] },
  },
}
