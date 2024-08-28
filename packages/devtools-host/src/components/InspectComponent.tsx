import {
  useElementBounding,
  useElementByPoint,
  useEventListener,
  useMouse,
} from "@kaioken-core/hooks"
import { useEffect, useMemo, useRef, useSyncExternalStore } from "kaioken"
import { getComponentVnodeFromElement, getNearestElm } from "../utils"
import { vNodeContains } from "kaioken/utils"
import { useDevtools } from "devtools-shared"

const dt = useDevtools()
const dtGet = dt.peek.bind(dt)
const dtSub = dt.subscribe.bind(dt)
//import { useDevTools } from "../hooks/useDevtools"

// open and send: openDevTools((w) => emitSelectNode(w, elApp, vnode))

export const InspectComponent: Kaioken.FC = () => {
  //const openDevTools = useDevTools()
  const { inspectorEnabled, popupWindow } = useSyncExternalStore(dtSub, dtGet)
  const { mouse } = useMouse()

  const controls = useElementByPoint({
    x: mouse.x,
    y: mouse.y,
    immediate: false,
  })
  const element = inspectorEnabled ? controls.element : null

  const elApp = useMemo(() => {
    if (element && window.__kaioken) {
      const app = window.__kaioken.apps.find(($app) => {
        if ($app.rootNode == null || element.__kaiokenNode == null) return false
        return vNodeContains($app.rootNode, element.__kaiokenNode)
      })

      if (app?.rootNode == null) return null
      return app
    }

    return null
  }, [element])

  const vnode = useMemo(() => {
    if (element) {
      return getComponentVnodeFromElement(element)
    }

    return null
  }, [element])

  const boundingRef = useRef<Element | null>(null)
  const bounding = useElementBounding(boundingRef)

  useEffect(() => {
    if (inspectorEnabled) {
      controls.start()
    } else {
      controls.stop()
    }
  }, [inspectorEnabled])

  useEffect(() => {
    if (vnode && element) {
      boundingRef.current = getNearestElm(vnode, element) ?? null
    } else {
      boundingRef.current = null
    }
  }, [vnode, element])

  useEventListener("click", (e) => {
    if (!inspectorEnabled) return
    if (!vnode || !elApp) return
    e.preventDefault()

    dt.value = {
      ...dt.value,
      selectedApp: elApp,
      selectedNode: vnode,
      inspectNode: vnode,
      inspectorEnabled: false,
    }
    if (popupWindow) popupWindow.focus()
  })

  return (
    vnode && (
      <div
        className="bg-[crimson]/80 fixed grid place-content-center pointer-events-none z-10 top-0 left-0"
        style={{
          width: `${bounding?.width}px`,
          height: `${bounding?.height}px`,
          transform: `translate(${bounding.x}px, ${bounding.y}px)`,
        }}
      >
        <p>{vnode.type.name}</p>
      </div>
    )
  )
}
