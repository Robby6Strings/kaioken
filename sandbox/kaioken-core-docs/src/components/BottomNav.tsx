import { getPrevAndNextRoute } from "$/utils/meta"
import { useTweenMemo } from "@kaioken-core/hooks"
import { signal, useMemo } from "kaioken"
import { twMerge } from "tailwind-merge"
import { sineInOut } from "@kaioken-core/hooks/easing"
import { useGlowAngle } from "$/hooks/useGlowAngle"

type ButtonNavLinkProps = {
  route: NonNullable<ReturnType<(typeof getPrevAndNextRoute)>[0]>,
  className: string
}
const BottomNavLink: Kaioken.FC<ButtonNavLinkProps> = (props) => {
  const [ref, angle] = useGlowAngle()
  const isFullGlow = signal(false)
  const glow = useTweenMemo(() => {
    if (isFullGlow.value) {
      return {
        start1: 0,
        start2: 0,
        finish1: 0,
        finish2: 100
      }
    }

    return {
      start1: 0,
      start2: 0,
      finish1: 100,
      finish2: 0
    }
  }, [isFullGlow.value], {
    duration: 250,
    easing: sineInOut
  })

  const glowGrad = useMemo(() => {
    return `linear-gradient(calc(var(--angle) + 90deg), #070707 ${glow.start1}% ${glow.finish1}%, #DC143C ${glow.start2}% ${glow.finish2}%)`
  }, Object.values(glow))

  return <div className="relative w-full">
    <div 
      ref={ref}
      style={`--angle: ${angle ?? '0deg'};--border-color: ${glowGrad}; --bg-color: linear-gradient(#191212, #191212)`}
      className="w-full border-2 border-[#0000] [background:padding-box_var(--bg-color),_border-box_var(--border-color)] bg-center h-full inset-0 absolute pointer-events-none rounded-xl" 
    />
    <a 
      href={props.route.route} 
      className={twMerge("bg-glass [background:rgba(25,18,18,0.6)] p-8 rounded-xl flex flex-col focus:outline-none", props.className)} 
      onmouseover={() => isFullGlow.value = true} 
      onmouseout={() => isFullGlow.value = false}
      onfocus={() => isFullGlow.value = true}
      onblur={() => isFullGlow.value = false}
    >
      {props.children}
      <span>{props.route.name}</span>
    </a>
  </div>
}

type ButtonNavProps = {
  currRoute: string
}
export const BottomNav: Kaioken.FC<ButtonNavProps> = (props) => {
  const [prev, next] = useMemo(() => getPrevAndNextRoute(props.currRoute), [props.currRoute])
  return <nav className="flex gap-4 mt-8" aria-label="next and before">
    {prev && <BottomNavLink className="" route={prev}>Previous</BottomNavLink>}
    {next && <BottomNavLink className="items-end" route={next}>Next</BottomNavLink>}
  </nav>
}
