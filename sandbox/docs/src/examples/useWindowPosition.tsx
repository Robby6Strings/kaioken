import { DemoContainer } from "$/components/DemoContainer"
import { useWindowPosition } from "@kaioken-core/hooks"

export const UseWindowPositionExample = () => {
  const { screenX, screenY } = useWindowPosition()
  return (
    <DemoContainer className="p-4 font-cabin flex gap-2 flex-col">
      <p>Move your window around</p>
      <p>
        X: {screenX}, Y: {screenY}
      </p>
    </DemoContainer>
  )
}
