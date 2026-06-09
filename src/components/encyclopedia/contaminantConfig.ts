import {
  Biohazard, Dna, Worm, Droplets, TestTube, Leaf, Gem,
  Waves, AlertTriangle, Layers, Package,
  Wrench, FlaskConical, Thermometer, Battery, Hexagon, CircuitBoard,
  Sprout, Bug, Scissors, Infinity, Wind, Flame,
  Diamond, Magnet, Atom, GlassWater, Cloud,
  Pill, Activity, RadioTower, AlertOctagon, Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const CONTAMINANT_ICONS: Record<string, LucideIcon> = {
  // Biological
  bacteria:          Biohazard,
  viruses:           Dna,
  protozoa:          Worm,
  cyanobacteria:     Waves,
  cyanotoxins:       AlertTriangle,

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

  // Emerging
  pharmaceuticals:   Pill,
  hormones:          Activity,

  // Radiological
  uranium:           RadioTower,
  radon:             AlertOctagon,
  radionuclides:     Zap,
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
