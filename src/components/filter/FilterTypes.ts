import {
  Layers, Zap, Droplets, CircleDot, Sun, Waves, AlignJustify, Flame, FlaskConical, Gauge,
  Wind, Thermometer,
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
    removes: ['turbidity', 'sediment'],
  },
  activated_carbon: {
    color: '#475569',
    label: 'Activated Carbon',
    Icon: Zap,
    removes: ['chlorine', 'pesticides', 'herbicides', 'vocs', 'petroleum'],
  },
  biosand: {
    color: '#92400e',
    label: 'Biosand Filter',
    Icon: Droplets,
    removes: ['bacteria', 'protozoa', 'cyanobacteria', 'turbidity', 'sediment'],
  },
  ceramic: {
    color: '#d97706',
    label: 'Ceramic Filter',
    Icon: CircleDot,
    removes: ['bacteria', 'protozoa', 'cyanobacteria', 'turbidity', 'sediment'],
  },
  uv: {
    color: '#a855f7',
    label: 'UV Disinfection',
    Icon: Sun,
    removes: ['bacteria', 'viruses', 'protozoa', 'cyanobacteria'],
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
  },
  slow_sand: {
    color: '#78716c',
    label: 'Slow Sand Filter',
    Icon: AlignJustify,
    removes: ['bacteria', 'protozoa', 'turbidity', 'sediment'],
  },
  boiling: {
    color: '#ef4444',
    label: 'Boiling',
    Icon: Flame,
    removes: ['bacteria', 'viruses', 'protozoa', 'cyanobacteria'],
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
  hollow_fiber: {
    color: '#38bdf8',
    label: 'Hollow Fiber UF',
    Icon: Wind,
    removes: ['bacteria', 'protozoa', 'cyanobacteria', 'turbidity', 'sediment', 'microplastics'],
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
  },
  water_softening: {
    color: '#60a5fa',
    label: 'Water Softening',
    Icon: Droplets,
    removes: ['hardness', 'iron', 'manganese'],
  },
  sediment_filtration: {
    color: '#a8a29e',
    label: 'Sediment Filtration',
    Icon: Layers,
    removes: ['turbidity', 'sediment'],
  },
}
