export const kaiokenGlobal =
  "window" in globalThis
    ? ((window.opener ?? window).__kaioken as typeof window.__kaioken)
    : undefined
