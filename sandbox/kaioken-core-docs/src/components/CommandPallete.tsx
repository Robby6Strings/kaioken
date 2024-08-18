import { usePageContext } from "$/context/pageContext"
import { Portal, signal, useEffect, useMemo, useRef } from "kaioken"
import { DemoContainer } from "./DemoContainer"
import { Input } from "./Input"
import { useKeyDown, useStartTyping } from "@kaioken-core/hooks"
import { Pages } from "$/utils/meta"
import Fuse from 'fuse.js'

const keyboardList = signal(new Map<string, {
  name: string,
  elm: Kaioken.Ref<HTMLElement | null>
}>())
const keyboardIndex = signal<number | null>(null)

export const CommandPaletteItem : Kaioken.FC<{ name: string, href: string }> = (props) => {
  const elm = useRef<HTMLElement | null>(null)
  const id = useMemo(() => crypto.randomUUID(), [])

  useEffect(() => {
    keyboardList.value.set(id, {
      name: props.name,
      elm,
    })

    return () => {
      if (keyboardList.value.has(id)) {
        keyboardList.value.delete(id)
      }
    }
  })

  return <a ref={elm} href={props.href} className="w-full focus:outline-0 focus:border-red p-4 bg-black rounded-lg border border-white/30">
    {props.name}
  </a>
}

export const CornerDownLeft = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-corner-down-left"><polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></svg>
}

export const MoveUp = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-move-up"><path d="M8 6L12 2L16 6"/><path d="M12 2V22"/></svg>
}

export const MoveDown = () => {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-move-down"><path d="M8 18L12 22L16 18"/><path d="M12 2V22"/></svg>
}

export const CommandPalette: Kaioken.FC<{ container: Kaioken.Ref<HTMLElement | null> }> = (props) => {
  const { isClient } = usePageContext()
  const searchValue = signal('')
  const inputRef = useRef<HTMLElement | null>(null)
  const pageList = useMemo(() => {
    const pages = [...Pages.entries()].map(([href, item]) => ({...item, href}))
    if (searchValue.value === '') {
      return pages
    }

    const fuse = new Fuse(pages, {
      keys: ['name']
    })
    return fuse.search(searchValue.value).map(({ item }) => item)
  }, [searchValue.value])

  const keyboardKeys = useMemo(() => [...keyboardList.value.keys()].reverse(), [...keyboardList.value.keys()])

  useEffect(() => {
    keyboardIndex.value = null
  }, [])

  useStartTyping(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }) 

  useKeyDown(['ArrowUp', 'ArrowDown', 'Home', 'End'], (e) => {
    e.preventDefault()

    if (keyboardIndex.value == null || e.key === 'Home') {
      keyboardIndex.value = 0
      return
    } else if (e.key === 'End') {
      keyboardIndex.value = keyboardList.value.size - 1
      return
    }

    if (e.key === 'ArrowUp' && keyboardIndex.value === 0) {
      keyboardIndex.value = keyboardList.value.size - 1
    } else if (e.key === 'ArrowUp') {
      keyboardIndex.value -= 1
    } else if (e.key === 'ArrowDown' && keyboardIndex.value === keyboardList.value.size - 1) {
      keyboardIndex.value = 0
    } else {
      keyboardIndex.value += 1
    }
  })

  useEffect(() => {
    if (keyboardIndex.value === null) {
      return
    }

    const id = keyboardKeys[keyboardIndex.value]
    const value = keyboardList.value.get(id)
    if (value) {
      value.elm.current?.focus()
    }
  }, [keyboardIndex.value, ...keyboardList.value.keys()])

  return isClient && <Portal container={document.body}>
    <div className="w-full h-screen fixed top-0 left-0 z-30 flex justify-center p-12 items-start bg-black/50" ariaLabel={"Escape to close"} ariaLive={"polite"}>
      <DemoContainer ref={props.container} className="w-[750px] p-4">
        <Input 
          ref={inputRef} 
          value={searchValue.value}
          oninput={(e) => searchValue.value = e.target.value}
          onfocus={() => keyboardIndex.value = null}
          placeholder="Search to find hook" 
        />
        <div className="w-full p-2 flex flex-col rounded-lg  mt-4 gap-4 h-[300px] overflow-y-auto mb-12">
          {pageList.map((item) => <CommandPaletteItem key={item.href} {...item} />)}
        </div>
        <div className="w-full bg-black bottom-0 p-4 mt-2 absolute inset-x-0 border-t border-white/20 rounded-b-xl flex gap-4">
          <span className="flex gap-2 items-center"><CornerDownLeft /> to select</span>
          <span className="flex gap-2 items-center"><MoveUp /> <MoveDown /> to navigate</span>
          <span className="flex gap-2 items-center"><span className="font-semibold text-[1.1rem] uppercase">esc</span> to close</span>
        </div>
      </DemoContainer>
    </div>
  </Portal>
}
