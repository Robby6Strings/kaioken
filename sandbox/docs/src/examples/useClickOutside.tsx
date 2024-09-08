import { Button } from "$/components/Button"
import { DemoContainer } from "$/components/DemoContainer"
import { useClickOutside } from "@kaioken-core/hooks"
import { useRef, useState } from "kaioken"

export const UseClickOutsideExample = () => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  useClickOutside(ref, () => {
    setIsOpen(false)
  })
  return (
    <>
      <DemoContainer
        className={"p-4 font-cabin flex gap-2 justify-start flex-col"}
      >
        <Button onclick={() => setIsOpen(true)}>Open model</Button>
      </DemoContainer>

      {isOpen && (
        <div className="w-full h-screen fixed top-0 left-0 bg-black/20 grid place-items-center z-10">
          <DemoContainer
            ref={ref}
            className="max-w-[600px] h-[200px] w-full grid place-items-center"
          >
            <p className="uppercase font-bold">Click outside to close</p>
          </DemoContainer>
        </div>
      )}
    </>
  )
}
