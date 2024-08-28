import {
  AppContext,
  signal,
  useEffect,
  useRequestUpdate,
  useSyncExternalStore,
} from "kaioken"
import { NodeListItem } from "./NodeListItem"
import { useKeyboardControls } from "../hooks/KeyboardControls"
import { SearchContext } from "../searchContext"
import { kaiokenGlobal } from "../kaiokenGlobal"
import { useDevtools } from "../store"

const dt = useDevtools()
const dtGet = dt.peek.bind(dt)
const dtSub = dt.subscribe.bind(dt)

export function AppView() {
  const dtStore = useSyncExternalStore(dtSub, dtGet)

  const requestUpdate = useRequestUpdate()
  const search = signal("")

  useEffect(() => {
    const handleUpdate = (appCtx: AppContext) => {
      if (appCtx !== dtStore.selectedApp) return
      requestUpdate()
    }
    kaiokenGlobal?.on("update", handleUpdate)
    return () => kaiokenGlobal?.off("update", handleUpdate)
  }, [])

  function handleSearchInput(txt: string) {
    // if (dtStore.inspectNode) {
    //   setInspectNode(null)
    //   setInspectorEnabled(false)
    // }

    search.value = txt
  }

  const { searchRef } = useKeyboardControls()

  return (
    <div className="flex-grow p-2 sticky top-0">
      <div className="flex gap-4 pb-2 border-b-2 border-neutral-800 mb-2 items-center">
        <h2 className="font-bold flex-shrink-0">App View</h2>
        <input
          ref={searchRef}
          className="bg-[#171616] px-1 py-2 w-full focus:outline focus:outline-crimson"
          placeholder="Search for component"
          type="text"
          value={search.value}
          oninput={(e) => handleSearchInput(e.target.value)}
        />
      </div>
      <SearchContext.Provider value={search.value}>
        {dtStore.selectedApp?.rootNode && (
          <NodeListItem node={dtStore.selectedApp.rootNode} />
        )}
      </SearchContext.Provider>
    </div>
  )
}
