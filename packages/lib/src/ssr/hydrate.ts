import type { AppContext, AppContextOptions } from "../appContext"
import { childIndexStack, hydrationStack, renderMode } from "../globals.js"
import { mount } from "../index.js"

export function hydrate<T extends Record<string, unknown>>(
  appFunc: (props: T) => JSX.Element,
  container: AppContextOptions,
  appProps?: T
): Promise<AppContext>

export function hydrate<T extends Record<string, unknown>>(
  appFunc: (props: T) => JSX.Element,
  container: HTMLElement,
  appProps?: T
): Promise<AppContext>

export function hydrate<T extends Record<string, unknown>>(
  appFunc: (props: T) => JSX.Element,
  optionsOrRoot: HTMLElement | AppContextOptions,
  appProps = {} as T
) {
  const root =
    optionsOrRoot instanceof HTMLElement ? optionsOrRoot : optionsOrRoot.root
  hydrationStack.push(root)
  childIndexStack.push(0)

  let prevRenderMode = renderMode.current
  renderMode.current = "hydrate"
  return new Promise((resolve) => {
    mount(appFunc, optionsOrRoot as any, appProps).then((ctx) => {
      renderMode.current = prevRenderMode
      resolve(ctx)
    })
  })
  // if (optionsOrRoot instanceof HTMLElement) {
  //   //optionsOrRoot.innerHTML = ""
  //   return mount(appFunc, optionsOrRoot, appProps)
  // }
  // //optionsOrRoot.root.innerHTML = ""
  return mount(appFunc, optionsOrRoot as any, appProps)
}
