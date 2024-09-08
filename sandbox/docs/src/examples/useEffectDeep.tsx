import { ElementProps, useAppContext, useState, useVNode } from "kaioken"
import { useEffectDeep } from "@kaioken-core/hooks"
import { DemoContainer } from "$/components/DemoContainer"
import { Button } from "$/components/Button"
import { Input } from "$/components/Input"

export const UseEffectDeepExample: Kaioken.FC = () => {
  const node = useVNode()
  const ctx = useAppContext()
  const [context, setContext] = useState({
    count: 0,
    name: "",
  })

  useEffectDeep(() => {
    console.log(
      "I will trigger when count and name change despite context being the same object reference"
    )
  }, [context])

  const onClick = () => {
    setContext(($context) => {
      $context.count += 1
      return $context
    })

    ctx.requestUpdate(node)
  }

  const onInput: ElementProps<"input">["oninput"] = (e) => {
    setContext(($context) => {
      $context.name = e.target.value
      return $context
    })

    ctx.requestUpdate(node)
  }

  return (
    <DemoContainer className="p-4 font-cabin flex gap-4 flex-col">
      <p>Open console to see logs</p>
      <div className="flex gap-4 rounded-lg">
        <Button className="w-[100px]" onclick={onClick}>
          Click me!
        </Button>
        <Input
          type="text"
          placeholder="Type name"
          className="grow-0 w-[250px]"
          value={context.name}
          oninput={onInput}
        />
      </div>
    </DemoContainer>
  )
}
