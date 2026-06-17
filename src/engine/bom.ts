import type { BOMLine, TierResult } from '@/types'
import modules from '@/data/modules.json'
import suppliers from '@/data/suppliers.json'

type RawModule = { id: string; nameKey: string; descriptionKey: string; type: string; removes: string[]; costUSD: number; diyDifficulty: string; materials: string[]; minPressureBar: number }
type RawSupplier = { id: string; name: string; country: string; url: string; modules: string[] }

export function generateBOM(tier: TierResult): BOMLine[] {
  const allModules = modules as RawModule[]
  const allSuppliers = suppliers as RawSupplier[]

  return tier.modules.map(moduleId => {
    const mod = allModules.find(m => m.id === moduleId)
    if (!mod) throw new Error(`Module not found: ${moduleId}`)

    const moduleSuppliers = allSuppliers.filter(s => s.modules.includes(moduleId))

    return {
      module: mod as unknown as import('@/types').Module,
      quantity: 1,
      unitCostUSD: mod.costUSD,
      totalCostUSD: mod.costUSD,
      suppliers: moduleSuppliers as unknown as import('@/types').Supplier[],
    }
  })
}
