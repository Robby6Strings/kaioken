import { AppContext, useEffect } from "kaioken"
import { getCurrentNode, getNodeAppContext } from "kaioken/dist/utils"
import { useDevtoolsStore, kaiokenGlobal } from "../store"
import { NodeListItem } from "./NodeListItem"

export function AppView() {
  const { value: app } = useDevtoolsStore((state) => state.selectedApp)

  const node = getCurrentNode()
  const ctx = getNodeAppContext(node!)

  function handleUpdate(appCtx: AppContext) {
    if (appCtx !== app || !node) return
    ctx?.requestUpdate(node)
  }
  useEffect(() => {
    kaiokenGlobal?.on("update", handleUpdate)
    return () => kaiokenGlobal?.off("update", handleUpdate)
  }, [])

  return (
    <div className="flex-grow p-2 sticky top-0">
      <h2 className="font-bold">App View</h2>
      <NodeListItem node={app?.rootNode} />
    </div>
  )
}
