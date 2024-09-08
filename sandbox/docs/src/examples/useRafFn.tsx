import { Button } from "$/components/Button"
import { DemoContainer } from "$/components/DemoContainer"
import { useRafFn } from "@kaioken-core/hooks"
import { useState } from "kaioken"

export const UseRafFnExample: Kaioken.FC = () => {
  const [count, setCount] = useState(0)
  const [delta, setDelta] = useState(0)
  const controls = useRafFn(
    ({ delta }) => {
      setCount(($count) => $count + 1)
      setDelta(delta)
    },
    {
      fpsLimit: 60,
      immediate: true,
    }
  )

  return (
    <DemoContainer className="p-4 font-cabin flex gap-4 flex-col">
      <p>Frames: {count}</p>
      <p>Delta: {Math.round(delta)}ms</p>
      <p>FPS: 60</p>
      <p>isPaused: {`${!controls.isActive}`}</p>
      <div className="flex gap-4">
        <Button onclick={() => controls.stop()}>Stop</Button>
        <Button
          className="bg-red p-1"
          onclick={() => {
            controls.start()
          }}
        >
          Start
        </Button>
      </div>
    </DemoContainer>
  )
}
