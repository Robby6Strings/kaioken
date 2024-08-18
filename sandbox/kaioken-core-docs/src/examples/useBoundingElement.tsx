import { DemoContainer } from "$/components/DemoContainer"
import { useElementBounding } from "@kaioken-core/hooks"
import { useRef } from "kaioken"

export const UseBoundingElementExample: Kaioken.FC = () => {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const bounding = useElementBounding(textAreaRef)
  return <DemoContainer className="p-4 font-cabin gap-4 h-[500px]">
    <textarea className="resize h-full w-full cursor-default rounded-md border border-gray-800 bg-[#121212] p-3.5 text-gray-100 transition-colors duration-500 placeholder:select-none placeholder:text-gray-500 focus:border-red focus:outline-none" ref={textAreaRef} value={JSON.stringify(bounding, null, 2)} />
  </DemoContainer>
}
