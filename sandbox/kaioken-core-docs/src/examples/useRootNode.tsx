import { DemoContainer } from '$/components/DemoContainer'
import { useRootNode } from '@kaioken-core/hooks'
import { useEffect } from 'kaioken'

export const UseRootNodeExample: Kaioken.FC = () => {
  const node = useRootNode()

  useEffect(() => {
    console.log('Root node', node)
  }, [])

  return <DemoContainer className="p-4 font-cabin flex gap-4 flex-col">
    <p>Open Console to see root node</p>
  </DemoContainer>
}
