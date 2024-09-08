import { useState } from "kaioken"
import { useEventListener } from "./useEventListener"

export const useMouse = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [delta, setDelta] = useState({ x: 0, y: 0 })
  const [client, setClient] = useState({ x: 0, y: 0 })

  useEventListener("mousemove", (event) => {
    setMouse({
      x: event.x,
      y: event.y,
    })

    setDelta({
      x: event.movementX,
      y: event.movementY,
    })

    setClient({
      x: event.clientX,
      y: event.clientY,
    })
  })

  return { mouse, delta, client }
}
