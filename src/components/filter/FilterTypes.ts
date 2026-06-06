import type { FilterType } from '@/types'

export type { FilterType }

export interface FilterVisualConfig {
  label: string
  textColor: string
  bgColor: string
  borderColor: string
  accentBg: string    // colored top-bar accent
  glowRgb: string     // raw RGB for animated box-shadow, e.g. '217,119,6'
  iconName: string    // Lucide icon component name
  removes: string[]   // canonical contaminant IDs this filter type removes
}

export const FILTER_VISUAL_CONFIG: Record<FilterType, FilterVisualConfig> = {
  sediment: {
    label: 'Sediment',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    accentBg: 'bg-amber-400',
    glowRgb: '217,119,6',
    iconName: 'Layers',
    removes: ['turbidity'],
  },
  activated_carbon: {
    label: 'Activated Carbon',
    textColor: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    accentBg: 'bg-slate-400',
    glowRgb: '100,116,139',
    iconName: 'Zap',
    removes: ['chlorine', 'heavy_metals'],
  },
  biosand: {
    label: 'Biosand',
    textColor: 'text-yellow-800',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    accentBg: 'bg-yellow-500',
    glowRgb: '161,98,7',
    iconName: 'Droplets',
    removes: ['bacteria', 'protozoa', 'turbidity'],
  },
  ceramic: {
    label: 'Ceramic',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    accentBg: 'bg-orange-400',
    glowRgb: '194,65,12',
    iconName: 'CircleDot',
    removes: ['bacteria', 'protozoa', 'turbidity'],
  },
  uv: {
    label: 'UV Disinfection',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    accentBg: 'bg-purple-400',
    glowRgb: '126,34,206',
    iconName: 'Sun',
    removes: ['bacteria', 'viruses', 'protozoa'],
  },
  ro: {
    label: 'Reverse Osmosis',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    accentBg: 'bg-blue-400',
    glowRgb: '29,78,216',
    iconName: 'Waves',
    removes: ['bacteria', 'viruses', 'protozoa', 'heavy_metals', 'nitrates', 'fluoride'],
  },
  slow_sand: {
    label: 'Slow Sand',
    textColor: 'text-lime-700',
    bgColor: 'bg-lime-50',
    borderColor: 'border-lime-300',
    accentBg: 'bg-lime-500',
    glowRgb: '77,124,15',
    iconName: 'AlignJustify',
    removes: ['bacteria', 'protozoa', 'turbidity'],
  },
  boiling: {
    label: 'Boiling',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    accentBg: 'bg-red-400',
    glowRgb: '185,28,28',
    iconName: 'Flame',
    removes: ['bacteria', 'viruses', 'protozoa'],
  },
  chlorination: {
    label: 'Chlorination',
    textColor: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-300',
    accentBg: 'bg-teal-400',
    glowRgb: '15,118,110',
    iconName: 'FlaskConical',
    removes: ['bacteria', 'viruses'],
  },
}
