import { useState } from 'react'
import { Wizard } from '@/components/configurator/Wizard'
import { ResultPanel } from '@/components/configurator/Result/ResultPanel'
import { useConfigurator } from '@/hooks/useConfigurator'
import type { WaterInput } from '@/types'

export default function Configurator() {
  const { recommendation, configure } = useConfigurator()
  const [done, setDone] = useState(false)

  const handleComplete = (input: WaterInput) => {
    configure(input)
    setDone(true)
  }

  if (done && recommendation) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ResultPanel recommendation={recommendation} />
      </div>
    )
  }

  return <Wizard onComplete={handleComplete} />
}
