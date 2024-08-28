import { twMerge } from "tailwind-merge"
import { Flame } from "./icon/Flame"
import { useBtnPos } from "./hooks/useBtnPos"
import { useEffectDeep, useSpring } from "@kaioken-core/hooks"
import {
  signal,
  Transition,
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "kaioken"
import { usePopup } from "./hooks/usePopup"
import { InspectComponent } from "./components/InspectComponent"
import { PageInfo } from "./icon/PageInfo"
import { SquareMouse } from "./icon/SquareMouse"
import { DevtoolsApp, useDevtools } from "devtools-shared"

const dt = useDevtools()
const dtGet = dt.peek.bind(dt)
const dtSub = dt.subscribe.bind(dt)

export default function App() {
  const toggled = signal(false)
  const handleOpen = usePopup()
  const { inspectorEnabled, selectedApp, selectedNode, popupWindow } =
    useSyncExternalStore(dtSub, dtGet)

  const {
    btnCoords,
    btnRef,
    viewPortRef,
    startMouse,
    elementBound,
    snapSide,
    updateBtnPos,
  } = useBtnPos()
  const isHorizontalSnap =
    snapSide.value === "left" || snapSide.value === "right"
  const isMounted = useRef(false)

  const [springBtnCoords, setSpringBtnCoords] = useSpring(btnCoords.value, {
    damping: 0.4,
  })

  useLayoutEffect(() => {
    if (isMounted.current === false) {
      setSpringBtnCoords(btnCoords.value, {
        hard: true,
      })
    }

    isMounted.current = true
  }, [Math.round(elementBound.width), Math.round(elementBound.height)])

  useEffectDeep(() => {
    setSpringBtnCoords(btnCoords.value)
  }, [btnCoords.value])

  useEffect(() => {
    if (toggled.value) {
      updateBtnPos()
    }
  }, [toggled.value, updateBtnPos])

  const handleToggleInspect = () => {
    dt.value.inspectorEnabled = !dt.value.inspectorEnabled
    dt.notify()
  }

  return (
    <>
      <div
        ref={viewPortRef}
        className="w-full h-0 fixed top-0 left-0 z-[-9999] overflow-scroll pointer-events-none"
      />
      <div
        ref={btnRef}
        className={`flex ${isHorizontalSnap ? "flex-col" : ""} ${toggled.value ? "rounded-3xl" : "rounded-full"} gap-1 items-center will-change-transform bg-crimson`}
        style={{
          transform: `translate3d(${Math.round(springBtnCoords.x)}px, ${Math.round(springBtnCoords.y)}px, 0)`,
        }}
      >
        <Transition
          in={toggled.value}
          duration={{
            in: 40,
            out: 150,
          }}
          element={(state) => {
            if (state === "exited") return null
            const opacity = state === "entered" ? "1" : "0"
            return (
              <>
                <button
                  onclick={() => handleOpen()}
                  style={{ opacity }}
                  className={`transition text-white rounded-full p-1 hover:bg-[#0003] ${isHorizontalSnap ? "mt-1" : "ml-1"}`}
                >
                  <PageInfo width={16} height={16} />
                </button>
                <button
                  onclick={handleToggleInspect}
                  style={{ opacity }}
                  className={`transition text-white rounded-full p-1 hover:bg-[#0003] ${inspectorEnabled ? "bg-[#0003]" : ""}`}
                >
                  <SquareMouse width={16} height={16} />
                </button>
              </>
            )
          }}
        />
        <button
          className={twMerge(
            "bg-crimson rounded-full p-1",
            startMouse.value && "pointer-events-none"
          )}
          onclick={() => {
            toggled.value = !toggled.value
          }}
          tabIndex={-1}
        >
          <Flame />
        </button>
      </div>
      {selectedApp && selectedNode && !popupWindow && (
        <div
          className="kaioken-devtools-embedded fixed will-change-transform"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <DevtoolsApp />
        </div>
      )}
      <InspectComponent />
    </>
  )
}
