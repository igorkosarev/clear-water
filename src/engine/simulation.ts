import type { WaterInput, SimulationResult, RankedRecommendation, SystemTemplate } from '@/types'
import systemTemplates from '@/data/system-templates.json'
import modules from '@/data/modules.json'

type RawTemplate = {
  id: string
  nameKey: string
  descriptionKey: string
  modules: string[]
  targetContaminants: string[]
  budgetTier: string
  suitableFor: string[]
}

type RawModule = {
  id: string
  costUSD: number
  removes: string[]
}

export function runSimulation(input: WaterInput): SimulationResult {
  const templates = systemTemplates as RawTemplate[]
  const allModules = modules as RawModule[]

  const getTemplateCost = (template: RawTemplate): number =>
    template.modules.reduce((sum, id) => {
      const mod = allModules.find(m => m.id === id)
      return sum + (mod?.costUSD ?? 0)
    }, 0)

  const scoreTemplate = (template: RawTemplate): number => {
    const budgetMatch = template.budgetTier === input.budget ? 2 : 0
    const sourceMatch = template.suitableFor.includes(input.source) ? 2 : 0
    const contaminantsCovered = input.contaminants.filter(c =>
      template.targetContaminants.includes(c)
    ).length
    const coverageScore = input.contaminants.length > 0
      ? (contaminantsCovered / input.contaminants.length) * 4
      : 0
    return budgetMatch + sourceMatch + coverageScore
  }

  const ranked: RankedRecommendation[] = templates
    .map(template => {
      const allRemoved = template.modules.flatMap(id =>
        allModules.find(m => m.id === id)?.removes ?? []
      )
      const uniqueRemoved = [...new Set(allRemoved)]
      const removedContaminants = input.contaminants.filter(c => uniqueRemoved.includes(c))
      const remainingContaminants = input.contaminants.filter(c => !uniqueRemoved.includes(c))

      return {
        template: template as unknown as SystemTemplate,
        score: scoreTemplate(template),
        removedContaminants,
        remainingContaminants,
        estimatedCostUSD: getTemplateCost(template),
      }
    })
    .sort((a, b) => b.score - a.score)

  return { recommendations: ranked }
}
