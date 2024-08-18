import { DemoContainer } from "$/components/DemoContainer"
import { useTextareaAutoSize } from "@kaioken-core/hooks"
import { useModel } from "kaioken"

export const UseTextareaAutoSizeExample = () => {
  const [ref, value] = useModel<HTMLTextAreaElement>('Press enter to resize text area')
  useTextareaAutoSize(ref)

  return <DemoContainer className="p-4 font-cabin flex gap-4 flex-col">
    <textarea 
      className="h-12 w-full cursor-default rounded-md border border-gray-800 bg-[#121212] p-3.5 text-gray-100 transition-colors duration-500 placeholder:select-none placeholder:text-gray-500 focus:border-red focus:outline-none" 
      ref={ref} 
      value={value} 
    />
  </DemoContainer>
}
