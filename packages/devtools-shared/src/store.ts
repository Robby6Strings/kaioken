import { AppContext, createStore, signal } from "kaioken"
import { isDevtoolsApp } from "./utils"
import { kaiokenGlobal } from "./kaiokenGlobal"

export const toggleElementToVnode = signal(false)
kaiokenGlobal?.on(
  // @ts-expect-error We have our own custom type here
  "__kaiokenDevtoolsInspectElementValue",
  // @ts-expect-error We have our own custom type here
  ({ value }) => {
    toggleElementToVnode.value = !!value
  }
)

const initialApps = (kaiokenGlobal?.apps ?? []).filter(
  (app) => !isDevtoolsApp(app)
)
const initialApp = (initialApps[0] ?? null) as AppContext | null

export const useDevtoolsStore = createStore(
  {
    apps: initialApps,
    selectedElement: null as Element | null,
    selectedApp: initialApp,
    selectedNode: null as (Kaioken.VNode & { type: Function }) | null,
    popupWindow: null as Window | null,
  },
  (set) => ({
    addApp: (app: AppContext) => {
      set((state) => ({ ...state, apps: [...state.apps, app] }))
    },
    setApps: (apps: Array<AppContext>) => {
      set((state) => ({ ...state, apps }))
    },
    removeApp: (app: AppContext) => {
      set((state) => ({ ...state, apps: state.apps.filter((a) => a !== app) }))
    },
    setSelectedElement: (element: Element | null) => {
      set((state) => ({ ...state, selectedElement: element }))
    },
    setSelectedApp: (app: AppContext | null) => {
      set((state) => ({ ...state, selectedApp: app }))
    },
    setSelectedNode: (node: (Kaioken.VNode & { type: Function }) | null) => {
      set((state) => ({ ...state, selectedNode: node }))
    },
  })
)

kaiokenGlobal?.on("mount", (app) => {
  if (!isDevtoolsApp(app)) {
    useDevtoolsStore.methods.addApp(app)
    const selected = useDevtoolsStore.getState().selectedApp
    if (!selected) {
      useDevtoolsStore.methods.setSelectedApp(app)
    }
  }
})
kaiokenGlobal?.on("unmount", (app) => {
  useDevtoolsStore.methods.removeApp(app)
  let nextSelected: AppContext | null = useDevtoolsStore.getState().selectedApp
  if (nextSelected === app) {
    const apps = useDevtoolsStore.getState().apps
    nextSelected = apps.length > 0 ? apps[0] : null
  }
  useDevtoolsStore.methods.setSelectedApp(nextSelected)
})
