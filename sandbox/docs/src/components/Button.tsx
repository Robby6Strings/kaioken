import { ElementProps } from "kaioken"

type ButtonProps = {
  className?: string
  onclick?: ElementProps<"button">["onclick"]
}

export const Button: Kaioken.FC<ButtonProps> = (props) => {
  return (
    <button
      className="inline-flex h-12 animate-background-shine items-center justify-center rounded-md border border-gray-800 bg-[linear-gradient(110deg,#181818,45%,#1e2631,55%,#181818)] bg-[length:200%_100%] px-6 font-medium text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50"
      onclick={props.onclick}
    >
      {props.children}
    </button>
  )
}
