import { SelectedNodeView } from "./components/SelectedNodeView"
import { FiftyFiftySplitter } from "./components/FiftyFiftySplitter"
import { AppView } from "./components/AppView"
import { Select } from "./components/Select"
import { SquareMouse } from "./icons/SquareMouse"
import { kaiokenGlobal } from "./kaiokenGlobal"
import { useDevtools } from "./store"
import { useSyncExternalStore } from "kaioken"

const dt = useDevtools()
const dtGet = dt.peek.bind(dt)
const dtSub = dt.subscribe.bind(dt)

export function DevtoolsApp() {
  const { apps, selectedApp, selectedNode, inspectorEnabled } =
    useSyncExternalStore(dtSub, dtGet)

  const onToggleInspect = () => {
    dt.value = {
      ...dt.value,
      inspectorEnabled: !dt.value.inspectorEnabled,
    }
  }

  const selectApp = (name: string) => {
    dt.value = {
      ...dt.value,
      selectedApp: apps.find((a) => a.name === name)!,
    }
  }

  return (
    <>
      <header className="p-2 bg-neutral-800 border-b border-black border-opacity-30 flex items-center gap-4">
        <Select
          className="bg-neutral-700 text-white rounded"
          options={[
            { text: "Select App", key: "select-app" },
            ...apps.map((app) => app.name),
          ]}
          value={selectedApp?.name ?? ""}
          onChange={selectApp}
        />
        <button
          onclick={onToggleInspect}
          className={`p-1 rounded ${inspectorEnabled ? "bg-neutral-900" : ""}`}
        >
          <SquareMouse />
        </button>
      </header>
      <FiftyFiftySplitter>
        {selectedApp && <AppView />}
        {selectedNode && selectedApp && (
          <SelectedNodeView
            selectedApp={selectedApp}
            selectedNode={selectedNode}
            setSelectedNode={(n) => {
              dt.value = {
                ...dt.value,
                selectedNode: n,
              }
            }}
            kaiokenGlobal={kaiokenGlobal}
          />
        )}
      </FiftyFiftySplitter>
    </>
  )
}
