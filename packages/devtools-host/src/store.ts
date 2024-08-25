import { type AppContext, signal } from "kaioken"

export const nodeInspection = signal<null | {
  node: Kaioken.VNode & { type: Function }
  app: AppContext
}>(null)

export const toggleElementToVnode = signal(false)
if ("window" in globalThis) {
  window.__kaioken?.on(
    // @ts-expect-error We have our own custom type here
    "__kaiokenDevtoolsInspectElementValue",
    // @ts-expect-error We have our own custom type here
    ({ value }) => {
      toggleElementToVnode.value = !!value
    }
  )
}

export const popup = signal(null as Window | null)
