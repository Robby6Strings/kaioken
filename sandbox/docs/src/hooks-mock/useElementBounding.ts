import { useLayoutEffect, useState } from "kaioken"
import { useEventListener } from "./useEventListener"
import { useResizeObserver } from "./useResizeObserver"
import { useMutationObserver } from "./useMutationObserver"

type UseElementBoundingOptions = {
  windowScroll?: boolean
  windowResize?: boolean
  immediate?: boolean
}

const getDefault = () => ({
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  x: 0,
  y: 0,
})

export const useElementBounding = (
  ref: Kaioken.MutableRefObject<Element | null>,
  options: UseElementBoundingOptions = {
    windowScroll: true,
    windowResize: true,
  }
) => {
  const windowScroll = options?.windowScroll ?? true
  const windowResize = options?.windowResize ?? true
  const immediate = options.immediate ?? true

  const [bounding, setBounding] = useState(getDefault)

  const update = () => {
    const el = ref.current

    if (!el) {
      setBounding(getDefault())
      return
    }

    const bounding = el.getBoundingClientRect()
    setBounding(bounding.toJSON())
  }

  useResizeObserver(ref, update)
  useMutationObserver(ref, update, {
    attributeFilter: ["style", "class"],
  })

  useEventListener(
    "scroll",
    () => {
      if (windowScroll) {
        update()
      }
    },
    { capture: true, passive: true }
  )

  useEventListener(
    "resize",
    () => {
      if (windowResize) {
        update()
      }
    },
    { passive: true }
  )

  useLayoutEffect(() => {
    if (immediate) {
      update()
    }
  }, [])

  return {
    ...bounding,
    update,
  }
}
