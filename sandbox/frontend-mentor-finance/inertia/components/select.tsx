import { useElementBounding, useRafFn } from '@kaioken-core/hooks'
import { createContext, signal, useContext, useEffect, useRef } from 'kaioken'
import { twMerge } from 'tailwind-merge'

const SelectContext = createContext<{
  value: any
  setValue: (value: Kaioken.StateSetter<any>) => void
  isSelectOpen: Kaioken.Signal<boolean>
} | null>(null)

type SelectProps<T> = {
  value: T
  setValue: (value: Kaioken.StateSetter<T>) => void
  containerClassName?: string

  children: {
    head: (props: {
      isSelectOpen: Kaioken.Signal<boolean>
      ref: Kaioken.Ref<HTMLElement | null>
    }) => JSX.Children
    itemContainer: (props: {}) => JSX.Children
  }
}
export const Select = <T,>(props: SelectProps<T>) => {
  const isSelectOpen = signal(false)
  const headRef = useRef<HTMLElement | null>(null)
  const headBounding = useElementBounding(headRef)

  const containerRef = useRef<HTMLElement | null>(null)
  const containerBounding = useElementBounding(containerRef)

  const containerPosition = signal({
    top: 0,
    left: 0,
  })

  useRafFn(
    () => {
      if (!isSelectOpen.value) return

      containerPosition.value.top = headBounding.bottom + 16
      containerPosition.value.left = headBounding.left
      containerPosition.notify()
    },
    {
      fpsLimit: 60,
      immediate: true,
    }
  )

  useEffect(() => {
    if (isSelectOpen.value) {
      containerRef.current?.showPopover()
    } else {
      containerRef.current?.hidePopover()
    }
  }, [isSelectOpen.value])

  return (
    <SelectContext.Provider value={{ value: props.value, setValue: props.setValue, isSelectOpen }}>
      {props.children.head({ isSelectOpen, ref: headRef })}
      {isSelectOpen.value && (
        <div
          style={{
            width: `${headBounding.width}px`,
            top: `${containerPosition.value.top}px`,
            left: `${containerPosition.value.left}px`,
          }}
          className={twMerge('fixed grid m-[unset]', props.containerClassName)}
          popover="manual"
          ref={containerRef}
        >
          {props.children.itemContainer({})}
        </div>
      )}
    </SelectContext.Provider>
  )
}

type SelectItemProps<T> = {
  children: (props: {
    value: T
    setValue: (value: Kaioken.StateSetter<T>) => void
    isSelectOpen: Kaioken.Signal<boolean>
  }) => JSX.Children
}

export const SelectItem = <T,>(props: SelectItemProps<T>) => {
  const ctx = useContext(SelectContext)
  if (!ctx) return

  return props.children(ctx)
}
