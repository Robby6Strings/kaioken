import { useKeyDown } from "./useKeyStroke"

export const isFocusedElementEditable = () => {
  const { activeElement, body } = document

  if (!activeElement) return false

  // If not element has focus, we assume it is not editable, too.
  if (activeElement === body) return false

  // Assume <input> and <textarea> elements are editable.
  switch (activeElement.tagName) {
    case "INPUT":
    case "TEXTAREA":
      return true
  }

  // Check if any other focused element id editable.
  return activeElement.hasAttribute("contenteditable")
}

export const isTypedCharValid = ({
  keyCode,
  metaKey,
  ctrlKey,
  altKey,
}: KeyboardEvent) => {
  if (metaKey || ctrlKey || altKey) return false

  // 0...9
  if (keyCode >= 48 && keyCode <= 57) return true

  // A...Z
  if (keyCode >= 65 && keyCode <= 90) return true

  // a...z
  if (keyCode >= 97 && keyCode <= 122) return true

  // All other keys.
  return
}

export const useStartTyping = (callback: (event: KeyboardEvent) => void) => {
  const keydown = (event: KeyboardEvent) => {
    !isFocusedElementEditable() && isTypedCharValid(event) && callback(event)
  }

  useKeyDown(true, keydown, {
    ref: () => document,
    passive: true,
  })
}
