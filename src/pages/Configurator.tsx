import { useState } from 'react'
import { Wizard } from '@/components/configurator/Wizard'
import { ResultPanel } from '@/components/configurator/Result/ResultPanel'
import { useConfigurator } from '@/hooks/useConfigurator'
import { useCountry } from '@/context/CountryContext'
import type { WaterInput } from '@/types'

export default function Configurator() {
  const { recommendation, configure } = useConfigurator()
  const { country } = useCountry()
  const [done, setDone] = useState(false)

  const handleComplete = (input: Omit<WaterInput, 'country'>) => {
    configure({ ...input, country: country ?? '' })
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
