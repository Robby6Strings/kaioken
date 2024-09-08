import { DemoContainer } from "$/components/DemoContainer"
import { useWindowSize } from "@kaioken-core/hooks"

export const UseWindowSizeExample = () => {
  const { width, height } = useWindowSize()
  return (
    <DemoContainer className="p-4 font-cabin flex gap-2 flex-col">
      <p>Resize your window</p>
      <p>
        Width: {width}px, Height: {height}px
      </p>
    </DemoContainer>
  )
}
