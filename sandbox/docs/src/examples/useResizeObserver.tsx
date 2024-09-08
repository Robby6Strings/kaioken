import { DemoContainer } from "$/components/DemoContainer"
import { useResizeObserver } from "@kaioken-core/hooks"
import { useRef } from "kaioken"

export const UseResizeObserverExample = () => {
  const ref = useRef<HTMLElement | null>(null)
  useResizeObserver(ref, () => {
    console.log("Text area has been resized")
  })
  return (
    <DemoContainer className="h-[350px]">
      <textarea
        ref={ref}
        className="resize w-full h-full cursor-default rounded-md border border-gray-800 bg-[#121212] p-3.5 text-gray-100 transition-colors duration-500 placeholder:select-none placeholder:text-gray-500 focus:border-red focus:outline-none"
        value="Open the Console and resize me."
      />
    </DemoContainer>
  )
}
