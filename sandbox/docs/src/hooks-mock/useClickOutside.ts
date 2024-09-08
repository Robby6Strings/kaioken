import { useEffect, useRef } from "kaioken"
import { useEventListener } from "./useEventListener"

const noop = () => {}

export type ClickOutsideOptions = {
  ignore?: (Kaioken.MutableRefObject<Element | null> | string)[]
  capture?: boolean
  detectIframe?: boolean
}

export type ClickOutsideHandler<
  T extends { detectIframe: ClickOutsideOptions["detectIframe"] } = {
    detectIframe: false
  },
> = (
  evt: T["detectIframe"] extends true
    ? PointerEvent | MouseEvent | FocusEvent
    : PointerEvent | MouseEvent
) => void

export const useClickOutside = <T extends ClickOutsideOptions>(
  ref: Kaioken.MutableRefObject<Element | null>,
  handler: ClickOutsideHandler<{ detectIframe: T["detectIframe"] }>,
  options: T = {} as T
) => {
  const ignore = options.ignore ?? []
  const capture = options.capture ?? true
  const detectIframe = options.detectIframe ?? false
  const shouldListen = useRef(true)
  const isIOSWorkaround = useRef(false)

  const shouldIgnore = (event: PointerEvent | MouseEvent) => {
    return ignore.some((target) => {
      if (typeof target === "string") {
        return Array.from(window.document.querySelectorAll(target)).some(
          (el) => el === event.target || event.composedPath().includes(el)
        )
      } else {
        const el = target.current
        return el && (event.target === el || event.composedPath().includes(el))
      }
    })
  }

  const listener = (event: PointerEvent | MouseEvent) => {
    const el = ref.current

    if (!el || el === event.target || event.composedPath().includes(el)) return

    if (event.detail === 0) shouldListen.current = !shouldIgnore(event)

    if (!shouldListen.current) {
      shouldListen.current = true
      return
    }

    handler(event)
  }

  useEventListener("click", listener, {
    passive: true,
    capture,
  })

  useEventListener(
    "pointerdown",
    (e) => {
      const el = ref.current
      shouldListen.current =
        !shouldIgnore(e) && !!(el && !e.composedPath().includes(el))
    },
    {
      passive: true,
    }
  )

  if (detectIframe) {
    useEventListener("blur", (event) => {
      setTimeout(() => {
        const el = ref.current
        if (
          window.document.activeElement?.tagName === "IFRAME" &&
          !el?.contains(window.document.activeElement)
        )
          handler(event as any)
      }, 0)
    })
  }

  useEffect(() => {
    const isIOS =
      window?.navigator?.userAgent &&
      (/iP(ad|hone|od)/.test(window.navigator.userAgent) ||
        (window?.navigator?.maxTouchPoints > 2 &&
          /iPad|Macintosh/.test(window?.navigator.userAgent)))

    if (isIOSWorkaround.current === false && isIOS) {
      isIOSWorkaround.current = true

      Array.from(window.document.body.children).forEach((el) =>
        el.addEventListener("click", noop)
      )
      window.document.documentElement.addEventListener("click", noop)
    }
  }, [isIOSWorkaround.current])
}
