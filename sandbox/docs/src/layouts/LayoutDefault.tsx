import { Navbar } from "$/components/Navbar"
import { SideBar } from "$/components/SideBar"
import "@fontsource-variable/cabin"

import "../css/mdx.css"
import "../css/shiki.css"
import { BottomNav } from "$/components/BottomNav"
import { usePageContext } from "$/context/pageContext"
import { useEffect } from "kaioken"
import { autoUpdate, computePosition, offset, shift } from "@floating-ui/dom"

export function LayoutDefault({ children }: { children: JSX.Children }) {
  const context = usePageContext()

  useEffect(() => {
    const codeNodes = document.querySelectorAll(".twoslash-popup-code")
    const cleanupFns: (() => void)[] = []

    codeNodes.forEach((anchorNode) => {
      if (anchorNode instanceof HTMLElement) {
        anchorNode.showPopover()
        const hoverNode = anchorNode.closest(".twoslash-hover")
        const cleanup = autoUpdate(hoverNode!, anchorNode, () => {
          computePosition(hoverNode!, anchorNode, {
            placement: "top",
            middleware: [offset(16), shift()],
          }).then(({ x, y }) => {
            Object.assign(anchorNode.style, {
              left: `${x}px`,
              top: `${y}px`,
            })
          })
        })

        cleanupFns.push(cleanup)
      }
    })

    return () => {
      cleanupFns.forEach((cleanup) => {
        cleanup()
      })
    }
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px,minmax(0,1fr)] gap-8 grid-rows-[max-content,1fr] items-center m-auto w-full min-h-screen">
      <Navbar />
      <SideBar />
      <div className="max-w-[1100px] text-white justify-self-center w-full h-full p-5">
        {children}
        <BottomNav currRoute={context!.urlPathname} />
      </div>
    </div>
  )
}
