
export const Pages = new Map([
  [
    '/state/useEffectDeep', {
      name: 'useEffectDeep'
    },
  ],
  [
    '/state/useEffectDebounce', {
      name: 'useEffectDebounce'
    },
  ],
  [
    '/state/useEffectThrottle', {
      name: 'useEffectThrottle'
    },
  ],
  [
    '/state/useRootNode', {
      name: 'useRootNode'
    },
  ],
  [
    '/browser/useClickOutside', {
      name: 'useClickOutside'
    },
  ],
  [
    '/browser/useEventListener', {
      name: 'useEventListener'
    },
  ],
  [
    '/browser/useIntersectionObserver', {
      name: 'useIntersectionObserver'
    },
  ],
  [
    '/browser/useMutationObserver', {
      name: 'useMutationObserver'
    },
  ],
  [
    '/browser/useResizeObserver', {
      name: 'useResizeObserver'
    },
  ],
  [
    '/browser/useKeyStroke', {
      name: 'useKeyStroke'
    },
  ],
  [
    '/browser/useMediaQuery', {
      name: 'useMediaQuery'
    },
  ],
  [
    '/browser/useMouse', {
      name: 'useMouse'
    },
  ],
  [
    '/browser/useMouseInElement', {
      name: 'useMouseInElement'
    },
  ],
  [
    '/browser/useStartTyping', {
      name: 'useStartTyping'
    },
  ],
  [
    '/browser/useWindowFocus', {
      name: 'useWindowFocus'
    },
  ],
  [
    '/browser/useWindowPosition', {
      name: 'useWindowPosition'
    },
  ],
  [
    '/browser/useWindowScroll', {
      name: 'useWindowScroll'
    },
  ],
  [
    '/browser/useWindowSize', {
      name: 'useWindowSize'
    },
  ],
  [
    '/elements/useActiveElement', {
      name: 'useActiveElement'
    },
  ],
  [
    '/elements/useParentElement', {
      name: 'useParentElement'
    },
  ],
  [
    '/elements/useCurrentElement', {
      name: 'useCurrentElement'
    },
  ],
  [
    '/elements/useElementBounding', {
      name: 'useElementBounding'
    },
  ],
  [
    '/elements/useElementByPoint', {
      name: 'useElementByPoint'
    },
  ],
  [
    '/elements/useElementVisibility', {
      name: 'useElementVisibility'
    },
  ],
  [
    '/elements/useTextareaAutoSize', {
      name: 'useTextareaAutoSize'
    },
  ],
  [
    '/animations/useTween', {
      name: 'useTween'
    },
  ],
  [
    '/animations/useTweenMemo', {
      name: 'useTweenMemo'
    },
  ],
  [
    '/animations/useSpring', {
      name: 'useSpring'
    },
  ],
  [
    '/animations/useSpringMemo', {
      name: 'useSpringMemo'
    },
  ],
  [
    '/animations/useRafFn', {
      name: 'useRafFn'
    },
  ],
])

export const getPrevAndNextRoute = (currentRoute: string) => {
  if (!Pages.has(currentRoute)) {
    console.warn('Cannot find route')
    return [null, null] as const
  }

  const keys = [...Pages.keys()]
  const values = [...Pages.values()]

  const routeIndex = keys.indexOf(currentRoute)
  const getObjWithRoute = (index: number) => {
    const value = values[index]
    if (!value) return null

    return {
      ...value,
      route: keys[index]
    }
  }

  return [getObjWithRoute(routeIndex - 1), getObjWithRoute(routeIndex + 1)] as const
}
