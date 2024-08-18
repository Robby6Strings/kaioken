import { disableAnimation } from "$/utils/disableAnimation"
import { ElementProps } from "kaioken"
import { twMerge } from "tailwind-merge"

type DemoContainerProps = {
  className?: string,
  ref?: ElementProps<'div'>['ref']
}
export const DemoContainer: Kaioken.FC<DemoContainerProps> = (props) => {
  return <div 
    ref={props.ref} 
    className={twMerge("p-4 w-full font-cabin bg-glass-red rounded-xl relative", props.className)}
    onmouseover={() => disableAnimation.value = true} 
    onmouseout={() => disableAnimation.value = false}
  >
    {props.children}
  </div>
}
