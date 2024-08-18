import { DemoContainer } from "$/components/DemoContainer"
import { Input } from "$/components/Input"
import { useStartTyping } from "@kaioken-core/hooks"
import { useRef } from "kaioken"

export const UseStartTypingExample = () => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  
  useStartTyping(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  })

  return <DemoContainer className="p-4 font-cabin flex gap-4 flex-col">
    <Input ref={inputRef} placeholder="start typing and it will focus this element" />
    <Input placeholder="typing on this element will not run the callback" />
  </DemoContainer>
}
