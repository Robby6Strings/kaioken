import { Button } from "$/components/Button"
import { DemoContainer } from "$/components/DemoContainer"
import { useWindowScroll } from "@kaioken-core/hooks"

export const UseWindowScrollExample = () => {
  const { setY, setX } = useWindowScroll()
  return (
    <DemoContainer className="p-4 font-cabin flex gap-2">
      <Button
        className="py-1 px-4 rounded-lg bg-red text-white"
        onclick={() => setY(50, "smooth")}
      >
        Scroll Y
      </Button>
      <Button
        className="py-1 px-4 rounded-lg bg-red text-white"
        onclick={() => setX(50, "smooth")}
      >
        Scroll X
      </Button>
    </DemoContainer>
  )
}
