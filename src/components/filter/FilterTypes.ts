import type { FilterType } from '@/types'

export type { FilterType }

export interface FilterVisualConfig {
  label: string
  color: string
  bgColor: string
  icon: string
}

export const FILTER_VISUAL_CONFIG: Record<FilterType, FilterVisualConfig> = {
  sediment: {
    label: 'Sediment Filter',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    icon: 'layers',
  },
  activated_carbon: {
    label: 'Activated Carbon',
    color: 'text-gray-700',
    bgColor: 'bg-gray-200',
    icon: 'zap',
  },
  biosand: {
    label: 'Biosand Filter',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    icon: 'droplets',
  },
  ceramic: {
    label: 'Ceramic Filter',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: 'circle',
  },
  uv: {
    label: 'UV Disinfection',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: 'sun',
  },
  ro: {
    label: 'Reverse Osmosis',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: 'filter',
  },
  slow_sand: {
    label: 'Slow Sand Filter',
    color: 'text-lime-700',
    bgColor: 'bg-lime-100',
    icon: 'align-justify',
  },
  boiling: {
    label: 'Boiling',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: 'flame',
  },
  chlorination: {
    label: 'Chlorination',
    color: 'text-teal-700',
    bgColor: 'bg-teal-100',
    icon: 'flask-conical',
  },
}
