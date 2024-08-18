import { DemoContainer } from "$/components/DemoContainer"
import { useIntersectionObserver } from "@kaioken-core/hooks"
import { signal, useRef } from "kaioken"

export const UseIntersectionObserverExample: Kaioken.FC = () => {
  const isVisible = signal(false)

  const ref = useRef<HTMLElement | null>(null)
  const controls = useIntersectionObserver(ref, (intersections) => {
    isVisible.value = intersections[0].isIntersecting
  })
  return <DemoContainer>
    <div className="w-full h-[300px] overflow-y-scroll">
      <div className="mb-[600px]" />
      <div ref={ref}>
        <p className="text-center">When viewing me...</p>
      </div>
      <div className="mt-[600px]" />
    </div>
    
    <p className="text-center mt-4 text-[1.5rem] font-bold">Element is {!isVisible.value && 'not'} in view</p>
    <p className="text-center mb-4 font-semibold">Scroll down</p>
  </DemoContainer>
}
