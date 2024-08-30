import { ElementProps } from 'kaioken'
import { twMerge } from 'tailwind-merge'

type InputProps<T> = Kaioken.FCProps<{
  value: T
  oninput: ElementProps<'input'>['oninput']
  type?: ElementProps<'input'>['type']
  placeholder?: ElementProps<'input'>['placeholder']
  className?: string
  classNameInput?: string
  helperText?: string
  postInput?: () => JSX.Children
}>

export const Input = <T extends ElementProps<'input'>['value']>(props: InputProps<T>) => {
  return (
    <label
      className={twMerge(
        'w-full flex flex-col gap-50 text-preset-5 font-bold text-grey-500',
        props.className
      )}
    >
      {props.children}
      <div className="flex gap-200 w-full items-center p-150  border border-beige-500 rounded-lg bg-white focus-within:outline-1 focus-within:outline focus-within:outline-grey-900">
        <input
          className={twMerge(
            'w-full text-preset-4 text-grey-900 placeholder:text-beige-500 focus:outline-none',
            props.classNameInput
          )}
          placeholder={props.placeholder ?? ''}
          type={props.type ?? 'text'}
          value={props.value}
          oninput={props.oninput}
        />
        {props.postInput && props.postInput()}
      </div>
      {props.helperText && (
        <p className="w-full text-right text-preset-5 text-grey-500">{props.helperText}</p>
      )}
    </label>
  )
}
