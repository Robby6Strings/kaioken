import { Button } from "$/components/Button"
import { DemoContainer } from "$/components/DemoContainer"
import { Input } from "$/components/Input"
import { useSpring } from "@kaioken-core/hooks"
import { useRef, useState } from "kaioken"

export const UseSpringExample: Kaioken.FC = () => {
  const nextValue = useRef(100)
  const [damping, setDamping] = useState(0.8)
  const [stiffness, setStiffness] = useState(0.15)
  const [precision, setPrecision] = useState(0.01)
  const [currentValue, setCurrentValue] = useSpring(100)

  const onUpdateValue = async () => {
    nextValue.current = nextValue.current === 100 ? 350 : 100

    await setCurrentValue(nextValue.current, {
      damping,
      stiffness,
      precision
    })
  }

  const onCancel = async () => {
    await setCurrentValue(nextValue.current, {
      hard: true,
    })
  }

  return <div className="relative">
    <div className="w-[var(--dim)] h-[var(--dim)] bg-red rounded-full absolute left-[calc(100%-250px)] top-1/2 -translate-x-1/2 -translate-y-1/2 origin-center" style={`--dim: ${currentValue}px`} />
    <DemoContainer className="[background:rgba(25,18,18,0.3)] grid grid-cols-2 gap-2 min-h-[380px]">
      <div className="flex flex-col gap-2">
        <label className="flex flex-col w-[200px]">
          Damping:
          <Input type="number" value={damping} oninput={(e) => setDamping(e.target.valueAsNumber)} />
        </label>
        <label className="flex flex-col w-[200px]">
          Stiffness:
          <Input type="number" value={stiffness} oninput={(e) => setStiffness(e.target.valueAsNumber)} />
        </label>
        <label className="flex flex-col w-[200px]">
          Precision:
          <Input type="number" value={precision} oninput={(e) => setPrecision(e.target.valueAsNumber)} />
        </label>
        <div className="flex gap-2 mt-2">
          <Button onclick={onUpdateValue}>
            Change
          </Button>
          <Button onclick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </DemoContainer>
  </div>
}
