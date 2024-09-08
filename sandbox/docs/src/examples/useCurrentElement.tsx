import { DemoContainer } from "$/components/DemoContainer"
import { useCurrentElement } from "@kaioken-core/hooks"

export const UseCurrentElementExample: Kaioken.FC = () => {
  const currentElm = useCurrentElement()
  console.log("current element", currentElm)

  return (
    <DemoContainer className="p-4 font-cabin flex gap-4 flex-col">
      <p>Open console to see current element</p>
    </DemoContainer>
  )
}
