import { disableAnimation } from "$/utils/disableAnimation"
import { useElementBounding, useMouse, useTweenMemo } from "@kaioken-core/hooks"
import { useMemo, useRef } from "kaioken"

function minAbs(x: number, y: number, old: number) {
  return Math.abs(x - old) < Math.abs(y - old) ? x : y
}

export const useGlowAngle = <T extends HTMLElement>(duration = 500) => {
  const ref = useRef<T | null>(null)
  const asideBounding = useElementBounding(ref)
  const [asideX, asideY] = useMemo(() => {
    return [
      asideBounding.width / 2 + asideBounding.left,
      asideBounding.height / 2 + asideBounding.top,
    ] as const
  }, [
    asideBounding.top,
    asideBounding.left,
    asideBounding.width,
    asideBounding.height,
  ])
  const { mouse } = useMouse()

  const oldAngle = useRef<number | null>(null)
  const angle = useTweenMemo(
    () => {
      const newAngle =
        Math.atan2(mouse.y - asideY, mouse.x - asideX) * (180 / Math.PI)

      if (!oldAngle.current) {
        oldAngle.current = newAngle
        return newAngle
      } else if (disableAnimation.value) {
        return oldAngle.current
      }

      const cycles = (oldAngle.current / 360) | 0

      // cycles being one full rotation
      // we compare if we should use the angle as is or one cycle back or forward
      const resultAngle = minAbs(
        minAbs(
          newAngle + cycles * 360,
          newAngle + (cycles - 1) * 360,
          oldAngle.current
        ),
        newAngle + (cycles + 1) * 360,
        oldAngle.current
      )

      oldAngle.current = resultAngle

      return resultAngle
    },
    [mouse.x, mouse.y, asideX, asideY, disableAnimation.value],
    {
      duration,
    }
  )

  return [ref, `${angle | 0}deg`] as const
}
