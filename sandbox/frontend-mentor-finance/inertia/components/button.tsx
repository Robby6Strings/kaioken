import { ElementProps } from 'kaioken'
import { twMerge } from 'tailwind-merge'

export const Button: Kaioken.FC<ElementProps<'button'>> = (props) => {
  const { className, ...rest } = props

  return (
    <button
      className={twMerge(
        'p-200 bg-grey-900 text-preset-4 font-bold text-white rounded-lg',
        className
      )}
      {...rest}
    >
      {props.children}
    </button>
  )
}
