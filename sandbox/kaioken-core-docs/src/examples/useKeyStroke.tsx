import { Button } from "$/components/Button"
import { DemoContainer } from "$/components/DemoContainer"
import { useKeyStroke } from "@kaioken-core/hooks"
import { signal } from "kaioken"

const transformKeys = (key: string) => {
  if (key === ' ') {
    return 'Space'
  }

  return key
}

export const UseKeyStrokeExample = () => {
  const keysPressed = signal<string[]>([])

  useKeyStroke(true, (e) => {
    keysPressed.value.push(
      transformKeys(e.key)
    )
    keysPressed.notify()
  })

  return <DemoContainer className="p-4 font-cabin h-[350px] flex items-start content-start gap-4 overflow-y-scroll flex-wrap">
    {keysPressed.value.map((key) => {
      return <Button className="text-white rounded-lg capitalize">{key}</Button>
    })}
  </DemoContainer>
}
