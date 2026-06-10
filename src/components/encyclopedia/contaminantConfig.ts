import {
  Biohazard, Dna, Worm, Droplets, TestTube, Leaf, Gem,
  Waves, AlertTriangle, Layers, Package,
  Wrench, FlaskConical, Thermometer, Battery, Hexagon, CircuitBoard,
  Sprout, Bug, Scissors, Infinity, Wind, Flame,
  Diamond, Magnet, Atom, GlassWater, Cloud,
  Pill, Activity, RadioTower, AlertOctagon, Zap,
  TrendingDown, TrendingUp, Pipette, ShieldAlert, Sigma,
  Droplet, Scale, Beaker, CircleDot, Scan, BarChart2, LayoutGrid,
  Microscope, Building2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const CONTAMINANT_ICONS: Record<string, LucideIcon> = {
  // Biological
  bacteria:          Biohazard,
  viruses:           Dna,
  protozoa:          Worm,
  helminths:         Worm,
  cyanobacteria:     Waves,
  cyanotoxins:       AlertTriangle,
  legionella:        Building2,

  // Physical
  turbidity:         Droplets,
  sediment:          Layers,
  microplastics:     Package,
  hardness:          Diamond,
  salinity:          GlassWater,

  // Heavy metals
  lead:              Wrench,
  arsenic:           FlaskConical,
  mercury:           Thermometer,
  cadmium:           Battery,
  chromium_6:        Hexagon,
  copper:            CircuitBoard,

  // Chemical — standard
  chlorine:          TestTube,
  nitrates:          Leaf,
  nitrites:          Sprout,
  fluoride:          Gem,

  // Agricultural
  pesticides:        Bug,
  herbicides:        Scissors,

  // Industrial
  pfas:              Infinity,
  vocs:              Wind,
  petroleum:         Flame,

  // Mineral
  iron:              Magnet,
  manganese:         Atom,
  hydrogen_sulfide:  Cloud,
  ammonia:           Microscope,

  // Industrial
  boron:             FlaskConical,
  cyanide:           AlertOctagon,

  // Emerging
  pharmaceuticals:   Pill,
  hormones:          Activity,

  // Radiological
  uranium:           RadioTower,
  radon:             AlertOctagon,
  radionuclides:     Zap,

  // Physical — water properties
  ph_low:            TrendingDown,
  ph_high:           TrendingUp,
  asbestos:          LayoutGrid,

  // Chemical — disinfection-related
  chloramines:              Pipette,
  disinfection_byproducts:  ShieldAlert,

  // Chemical — common ions
  sulfate:           Sigma,
  chloride:          Droplet,
  sodium:            Scale,

  // Chemical — secondary metals
  aluminum:          Beaker,
  nickel:            CircleDot,
  selenium:          Scan,
  barium:            BarChart2,
}

export const CATEGORY_ORDER = ['biological', 'physical', 'chemical', 'radiological'] as const

export const CATEGORY_META: Record<string, { label: string; description: string; color: string; Icon: LucideIcon }> = {
  biological: {
    label: 'Biological',
    description: 'Living organisms and toxins that cause infection or illness',
    color: '#f43f5e',
    Icon: Biohazard,
  },
  physical: {
    label: 'Physical',
    description: 'Particles, turbidity, and dissolved solids affecting water clarity',
    color: '#f59e0b',
    Icon: Layers,
  },
  chemical: {
    label: 'Chemical',
    description: 'Dissolved inorganic compounds, metals, and synthetic chemicals',
    color: '#60a5fa',
    Icon: FlaskConical,
  },
  radiological: {
    label: 'Radiological',
    description: 'Naturally occurring and anthropogenic radioactive contaminants',
    color: '#a78bfa',
    Icon: Atom,
  },
}

// Chemical / elemental symbols — shown as periodic-table tiles instead of Lucide icons
export const CHEMICAL_SYMBOLS: Record<string, string> = {
  lead:             'Pb',
  arsenic:          'As',
  mercury:          'Hg',
  cadmium:          'Cd',
  chromium_6:       'Cr⁶⁺',
  copper:           'Cu',
  iron:             'Fe',
  manganese:        'Mn',
  uranium:          'U',
  radon:            'Rn',
  sodium:           'Na',
  aluminum:         'Al',
  nickel:           'Ni',
  selenium:         'Se',
  barium:           'Ba',
  fluoride:         'F⁻',
  chloride:         'Cl⁻',
  nitrites:         'NO₂⁻',
  nitrates:         'NO₃⁻',
  hydrogen_sulfide: 'H₂S',
  ammonia:          'NH₄⁺',
  boron:            'B',
  cyanide:          'CN⁻',
}

export const BADGE_CLASS: Record<string, string> = {
  biological:   'text-red-400    border border-red-400/30    bg-red-400/10',
  chemical:     'text-blue-400   border border-blue-400/30   bg-blue-400/10',
  physical:     'text-amber-400  border border-amber-400/30  bg-amber-400/10',
  radiological: 'text-purple-400 border border-purple-400/30 bg-purple-400/10',
}

export const COMPLEXITY_CLASS: Record<string, string> = {
  beginner:     'text-emerald-400 border border-emerald-400/30 bg-emerald-400/10',
  intermediate: 'text-amber-400   border border-amber-400/30  bg-amber-400/10',
  advanced:     'text-red-400     border border-red-400/30    bg-red-400/10',
}

export const COST_CLASS: Record<string, string> = {
  low:    'text-emerald-400 border border-emerald-400/30 bg-emerald-400/10',
  medium: 'text-amber-400   border border-amber-400/30  bg-amber-400/10',
  high:   'text-red-400     border border-red-400/30    bg-red-400/10',
}
