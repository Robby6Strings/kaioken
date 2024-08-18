import { DemoContainer } from "$/components/DemoContainer"
import { useMutationObserver } from "@kaioken-core/hooks"
import { signal, useEffect, useRef } from "kaioken"
import { twMerge } from "tailwind-merge"

export const UseMutationObserverExample: Kaioken.FC = () => {
  const el = useRef<HTMLElement | null>(null)
  const style = signal({})
  const className = signal('')
  const changes = signal<(string | null)[]>([])
  const count = signal(0)

  useEffect(() => {
    const styleTimeoutId = setTimeout(() => {
      style.value = { color: 'red' } 
    }, 1000)

    const classNameTimeoutId = setTimeout(() => {
      className.value = 'test'
    }, 2000)

    return () => {
      clearTimeout(styleTimeoutId)
      clearTimeout(classNameTimeoutId)
    }
  }, [])

  const reset = () => {
    changes.value = []
    changes.notify()
    style.value = {}
    className.value = ''

    const styleTimeoutId = setTimeout(() => {
      style.value = { color: 'red' } 
    }, 2000)

    const classNameTimeoutId = setTimeout(() => {
      className.value = 'test'
    }, 3000)
  }

  const controls = useMutationObserver(el, (mutation) => {
    mutation.forEach(el => {
      if (el) {
        changes.value.push(el.attributeName)
      }
    })
    changes.notify()
  }, {
    attributes: true
  })

  return <DemoContainer>
    <div ref={el} className={twMerge("w-full p-4 bg-grey-700 rounded-lg flex flex-col", className.value)} style={style.value}>
      {changes.value.map(attr => {
        return <p>Mutation Attribute: {attr}</p>
      })}
      <button onclick={() => count.value += 1}>increment {count.value}</button>
      <button onclick={reset}>reset</button>
      <button onclick={() => {
        controls.stop()
      }}>stop</button>
      <button onclick={() => {
        controls.start()
      }}>start</button>
    </div>
  </DemoContainer>
}
