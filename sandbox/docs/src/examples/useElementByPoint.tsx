import {
  useElementBounding,
  useElementByPoint,
  useMouse,
} from "@kaioken-core/hooks"
import { useEffect, useRef } from "kaioken"

export const UseElementByPointExample: Kaioken.FC = () => {
  const { mouse } = useMouse()
  const { element } = useElementByPoint({
    x: mouse.x,
    y: mouse.y,
    multiple: false,
    immediate: true,
  })

  const boundRef = useRef<null | Element>(null)
  const bounding = useElementBounding(boundRef)
  useEffect(() => {
    boundRef.current = element
  }, [element])

  return (
    <>
      <div
        className="bg-red -translate-x-1/2 -translate-y-1/2 w-[20px] h-[20px] pointer-events-none z-10 rounded-full fixed"
        style={{ top: `${mouse.y}px`, left: `${mouse.x}px` }}
      />

      <div
        className="bg-red/50 fixed pointer-events-none transition-all ease-linear duration-75 z-10 top-0 left-0"
        style={{
          width: `${bounding?.width}px`,
          height: `${bounding?.height}px`,
          transform: `translate(${bounding.x}px, ${bounding.y}px)`,
        }}
      />
    </>
  )
}
