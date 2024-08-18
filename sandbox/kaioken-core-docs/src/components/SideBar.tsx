import { usePageContext } from "$/context/pageContext"
import { signal } from "kaioken"
import { twMerge } from "tailwind-merge"
import { GlowBg } from "./GlowBG"

type GroupProps = {
  title: string
}
export const Group: Kaioken.FC<GroupProps> = (props) => {
  const show = signal(true)

  return <>
    <button className="text-[1.125rem] text-left font-semibold" onclick={() => show.value = !show.value}>{props.title}</button>
    {show.value && <div className="flex flex-col gap-2 border-l-[2px] border-white/20 px-4">
      {props.children}
    </div>}
  </>
}

type LinkProps = {
  href?: string
}
export const Link: Kaioken.FC<LinkProps> = (props) => {
  const pageCtx = usePageContext() as any
  const isActive = pageCtx!.urlPathname === props.href
  return <a 
    href={props.href} 
    className={twMerge(
      'font-cabin text-white/80 font-medium text-[0.9rem] p-1 rounded-sm',
      isActive && 'text-metalic p-1 font-bold text-[1rem]'
    )}
  >
    {props.children}
  </a>
}

export const SideBar = () => {
  const isFullGlow = signal(false)
  return <nav className="w-[300px] self-start sticky top-4 rounded-xl">
    <GlowBg isFullGlow={isFullGlow.value} />
    <aside 
      className="bg-glass flex flex-col gap-2 relative inset-0 py-4 px-4 rounded-xl"
      onmouseover={() => {
        isFullGlow.value = true
      }}
      onmouseout={() => {
        isFullGlow.value = false
      }}
    >
      <Group title="State">
        <Link href="/state/useEffectDeep">useEffectDeep</Link>
        <Link href="/state/useEffectDebounce">useEffectDebounce</Link>
        <Link href="/state/useEffectThrottle">useEffectThrottle</Link>
        <Link href="/state/useRootNode">useRootNode</Link>
      </Group>

      <Group title="Browser">
        <Link href="/browser/useClickOutside">useClickOutside</Link>
        <Link href="/browser/useEventListener">useEventListener</Link>
        <Link href="/browser/useIntersectionObserver">useIntersectionObserver</Link>
        <Link href="/browser/useMutationObserver">useMutationObserver</Link>
        <Link href="/browser/useResizeObserver">useResizeObserver</Link>
        <Link href="/browser/useKeyStroke">useKeyStroke</Link>
        <Link href="/browser/useMediaQuery">useMediaQuery</Link>
        <Link href="/browser/useMouse">useMouse</Link>
        <Link href="/browser/useMouseInElement">useMouseInElement</Link>
        <Link href="/browser/useStartTyping">useStartTyping</Link>
        <Link href="/browser/useWindowFocus">useWindowFocus</Link>
        <Link href="/browser/useWindowPosition">useWindowPosition</Link>
        <Link href="/browser/useWindowScroll">useWindowScroll</Link>
        <Link href="/browser/useWindowSize">useWindowSize</Link>
      </Group>

      <Group title="Elements">
        <Link href="/elements/useActiveElement">useActiveElement</Link>
        <Link href="/elements/useParentElement">useParentElement</Link>
        <Link href="/elements/useCurrentElement">useCurrentElement</Link>
        <Link href="/elements/useElementBounding">useElementBounding</Link>
        <Link href="/elements/useElementByPoint">useElementByPoint</Link>
        <Link href="/elements/useElementVisibility">useElementVisibility</Link>
        <Link href="/elements/useTextareaAutoSize">useTextareaAutoSize</Link>
      </Group>

      <Group title="Animations">
        <Link href="/animations/useTween">useTween</Link>
        <Link href="/animations/useTweenMemo">useTweenMemo</Link>
        <Link href="/animations/useSpring">useSpring</Link>
        <Link href="/animations/useSpringMemo">useSpringMemo</Link>
        <Link href="/animations/useRafFn">useRafFn</Link>
      </Group>
  </aside>
  </nav>
}
