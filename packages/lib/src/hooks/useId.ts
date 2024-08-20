import { ELEMENT_ID_BASE } from "../constants.js"
import { sideEffectsEnabled, useAppContext, useHook } from "./utils.js"

export function useId(): string {
  const ctx = useAppContext()
  if (!sideEffectsEnabled()) {
    return `:k${ctx.elementCounter.toString(ELEMENT_ID_BASE)}:`
  }
  return useHook(
    "useId",
    {
      id: undefined as any as string,
    },
    ({ hook, isInit }) => {
      if (isInit) {
        hook.id = `:k${ctx.elementCounter.toString(ELEMENT_ID_BASE)}:`
      }
      return hook.id
    }
  )
}
