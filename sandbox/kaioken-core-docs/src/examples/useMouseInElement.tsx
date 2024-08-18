import { DemoContainer } from "$/components/DemoContainer"
import { useMouseInElement } from "@kaioken-core/hooks"
import { useRef } from "kaioken"

export const UseMouseInElementExample: Kaioken.FC = () => {
  const ref = useRef<HTMLElement | null>(null)
  const result = useMouseInElement(ref)

  return <DemoContainer ref={ref} className="p-4 font-cabin flex gap-4 min-h-[300px] flex-col">
    <p>Move your mouse around</p>
    <textarea className="w-full resize h-[270px] cursor-default rounded-md border border-gray-800 bg-[#121212] p-3.5 text-gray-100 transition-colors duration-500 placeholder:select-none placeholder:text-gray-500 focus:border-red focus:outline-none" value={ JSON.stringify(result, null, 2) } />
  </DemoContainer>
}
