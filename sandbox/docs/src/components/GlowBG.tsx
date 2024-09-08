import { useGlowAngle } from "$/hooks/useGlowAngle"
import { useTweenMemo } from "@kaioken-core/hooks"
import { useMemo } from "kaioken"
import { sineInOut } from "@kaioken-core/hooks/easing"

type GlowBgProps = {
  duration?: number
  isFullGlow?: boolean
}
export const GlowBg: Kaioken.FC<GlowBgProps> = (props) => {
  const [glowRef, angle] = useGlowAngle(props.duration)

  const glow = useTweenMemo(
    () => {
      if (props.isFullGlow) {
        return {
          start1: 0,
          start2: 0,
          finish1: 0,
          finish2: 100,
        }
      }

      return {
        start1: 0,
        start2: 50,
        finish1: 50,
        finish2: 100,
      }
    },
    [props.isFullGlow],
    {
      duration: 250,
      easing: sineInOut,
    }
  )

  const glowGrad = useMemo(() => {
    return `linear-gradient(calc(var(--angle) + 90deg), #070707 ${glow.start1}% ${glow.finish1}%, #DC143C ${glow.start2}% ${glow.finish2}%)`
  }, Object.values(glow))

  return (
    <div
      ref={glowRef}
      style={`--angle: ${angle ?? "0deg"};--border-color: ${glowGrad}; --bg-color: linear-gradient(#191212, #191212)`}
      className="w-full border-2 border-[#0000] [background:padding-box_var(--bg-color),_border-box_var(--border-color)] bg-center h-full inset-0 absolute pointer-events-none rounded-xl"
    />
  )
}
