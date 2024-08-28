import { AppContext, signal } from "kaioken"
import { isDevtoolsApp } from "./utils"
import { kaiokenGlobal } from "./kaiokenGlobal"

const initialApps = (kaiokenGlobal?.apps ?? []).filter(
  (app) => !isDevtoolsApp(app)
)
const initialApp = (initialApps[0] ?? null) as AppContext | null

declare global {
  interface Window {
    __kaiokenDevtoolsState: typeof dt
  }
}

type DevtoolsState = {
  apps: typeof initialApps
  selectedApp: typeof initialApp
  selectedNode: (Kaioken.VNode & { type: Function }) | null
  popupWindow: Window | null
  inspectorEnabled: boolean
  inspectNode: (Kaioken.VNode & { type: Function }) | null
}

const dt = signal<DevtoolsState>({
  apps: initialApps,
  selectedApp: initialApp,
  selectedNode: null as (Kaioken.VNode & { type: Function }) | null,
  popupWindow: null as Window | null,
  inspectorEnabled: false,
  inspectNode: null as (Kaioken.VNode & { type: Function }) | null,
})
if ("window" in globalThis) {
  if (!window.opener) {
    window.__kaiokenDevtoolsState = dt
    kaiokenGlobal?.on("mount", (app) => {
      if (!isDevtoolsApp(app)) {
        dt.value.apps.push(app)
        dt.value.selectedApp ??= app
        dt.notify()
      }
    })
    kaiokenGlobal?.on("unmount", (app) => {
      dt.value.apps = dt.value.apps.filter((a) => a !== app)
      let nextSelected: AppContext | null = dt.value.selectedApp
      if (nextSelected === app) {
        const apps = dt.value.apps
        nextSelected = apps.length > 0 ? apps[0] : null
      }
      dt.notify()
    })
  } else {
    ;(window.opener as typeof window).__kaiokenDevtoolsState.subscribe(
      (s) => (dt.value = s)
    )
  }
}

export const useDevtools = () => dt
