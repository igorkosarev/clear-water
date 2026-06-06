import type { ModuleId } from '@/types'
import rules from '@/data/compatibility-rules.json'

type RawRule = { id: string; modules: [string, string]; compatible: boolean; reason: string }

export function areModulesCompatible(a: ModuleId, b: ModuleId): boolean {
  const allRules = rules as RawRule[]
  const rule = allRules.find(
    r => (r.modules[0] === a && r.modules[1] === b) || (r.modules[0] === b && r.modules[1] === a)
  )
  return rule?.compatible ?? true
}

export function getCompatibilityReason(a: ModuleId, b: ModuleId): string | null {
  const allRules = rules as RawRule[]
  const rule = allRules.find(
    r => (r.modules[0] === a && r.modules[1] === b) || (r.modules[0] === b && r.modules[1] === a)
  )
  return rule?.reason ?? null
}
