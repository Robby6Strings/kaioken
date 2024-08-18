import {useState } from "kaioken"
import { useEffectThrottle } from '@kaioken-core/hooks'
import { DemoContainer } from "$/components/DemoContainer"
import { Button } from "$/components/Button"

export const UseEffectThrottleExample: Kaioken.FC = () => {
  const [count, setCount] = useState(0)

  useEffectThrottle(() => {
    console.log('count change!');
  }, [count], {
    maxWait: 1000,
  })

  const onClick = () => {
    setCount(count + 1)
  }


  return <DemoContainer className="p-4 font-cabin flex gap-4 flex-col">
    <p>Open console to see logs</p>
    <div className="flex gap-4 rounded-lg items-center">
      <Button onclick={onClick}>Click me!</Button>
      <p className="uppercase font-bold text-metalic">count: {count}</p>
    </div>
  </DemoContainer>
}
