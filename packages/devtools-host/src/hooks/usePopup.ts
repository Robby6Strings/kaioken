import { useDevtools } from "devtools-shared"
import { useCallback, useSyncExternalStore } from "kaioken"

type SavedSize = {
  width: number
  height: number
}

const SIZE_STORAGE_KEY = "kaioken-devtools-popup-size"

const dt = useDevtools()
const dtGet = dt.peek.bind(dt)
const dtSub = dt.subscribe.bind(dt)

export const usePopup = () => {
  const { popupWindow } = useSyncExternalStore(dtSub, dtGet)

  const handleOpen = useCallback(
    (onOpened?: (window: Window) => void) => {
      if (popupWindow) return popupWindow.focus()
      const savedSize_raw = sessionStorage.getItem(SIZE_STORAGE_KEY)
      const size = savedSize_raw
        ? (JSON.parse(savedSize_raw) as SavedSize)
        : {
            width: Math.floor(window.innerWidth / 2),
            height: Math.floor(window.innerHeight / 2),
          }
      const features = `popup,width=${size.width},height=${size.height};`
      const w = window.open("/__devtools__", "_blank", features)
      if (!w) return console.error("[kaioken]: Unable to open devtools window")

      w.onload = () => {
        dt.value.popupWindow = w
        dt.notify()
        console.debug("[kaioken]: devtools window opened")
        setTimeout(() => onOpened?.(w), 250)
        w.onbeforeunload = () => {
          console.debug("[kaioken]: devtools window closed")
          dt.value.popupWindow = null
          dt.notify()
        }
      }
      w.onresize = () => {
        sessionStorage.setItem(
          SIZE_STORAGE_KEY,
          JSON.stringify({
            width: w.innerWidth,
            height: w.innerHeight,
          })
        )
      }
    },
    [popupWindow]
  )

  return handleOpen
}
