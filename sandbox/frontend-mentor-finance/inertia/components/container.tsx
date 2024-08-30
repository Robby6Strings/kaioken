import { twMerge } from 'tailwind-merge'

type ContainerProps = {
  className?: string
}

export const Container: Kaioken.FC<ContainerProps> = (props) => {
  return (
    <div className={twMerge('p-300 rounded-xl bg-white', props.className)}>{props.children}</div>
  )
}
