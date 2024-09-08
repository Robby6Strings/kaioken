import { DemoContainer } from "$/components/DemoContainer"
import { useMouse } from "@kaioken-core/hooks"

export const UseMouseExample: Kaioken.FC = () => {
  const result = useMouse()
  return (
    <DemoContainer className="p-4 font-cabin flex gap-2 flex-col">
      <p>Move your mouse around</p>
      <p>
        Client X: {result.client.x}px, Y: {result.client.y}px
      </p>
      <p>
        Mouse X: {result.mouse.x}px, Y: {result.mouse.y}px
      </p>
      <p>
        Delta X: {result.delta.x}px, Y: {result.delta.y}px
      </p>
    </DemoContainer>
  )
}
