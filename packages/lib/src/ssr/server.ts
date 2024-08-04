import { Readable } from "node:stream"
import { Component, createElement } from "../index.js"
import { AppContext } from "../appContext.js"
import { renderMode, ctx, node } from "../globals.js"

import {
  encodeHtmlEntities,
  isVNode,
  propFilters,
  propToHtmlAttr,
  propValueToHtmlAttrValue,
  selfClosingTags,
} from "../utils.js"
import { Signal } from "../signal.js"
import { elementTypes as et } from "../constants.js"
import { assertValidElementProps } from "../props.js"

export { renderToReadableStream }

type RequestState = {
  stream: Readable
  ctx: AppContext
}

function renderToReadableStream<T extends Record<string, unknown>>(
  el: (props: T) => JSX.Element,
  elProps = {} as T
): Readable {
  const prev = renderMode.current
  renderMode.current = "stream"
  const state: RequestState = {
    stream: new Readable(),
    ctx: new AppContext<any>(el, elProps),
  }
  const prevCtx = ctx.current
  ctx.current = state.ctx
  state.ctx.rootNode = el instanceof Function ? createElement(el, elProps) : el
  renderReadableToStream_internal(state, state.ctx.rootNode, undefined, elProps)

  state.stream.push(null)
  renderMode.current = prev
  ctx.current = prevCtx

  return state.stream
}

function renderReadableToStream_internal(
  state: RequestState,
  el: unknown,
  parent: Kaioken.VNode | undefined,
  elProps = {} as Record<string, unknown>
): void {
  if (el === null) return
  if (el === undefined) return
  if (typeof el === "boolean") return
  if (typeof el === "string") {
    state.stream.push(encodeHtmlEntities(el))
    return
  }
  if (typeof el === "number" || typeof el === "bigint") {
    state.stream.push(el.toString())
    return
  }
  if (typeof el === "function") {
    renderReadableToStream_internal(state, createElement(el, elProps), parent)
    return
  }
  if (el instanceof Array) {
    el.forEach((c) => renderReadableToStream_internal(state, c, parent))
    return
  }
  if (Signal.isSignal(el)) {
    renderReadableToStream_internal(state, el.value, parent)
    return
  }
  if (!isVNode(el)) {
    state.stream.push(String(el))
    return
  }

  el.parent = parent
  const props = el.props ?? {}
  const children = props.children
  const type = el.type
  if (type === et.text) {
    state.stream.push(encodeHtmlEntities(props.nodeValue ?? ""))
    return
  }
  if (type === et.fragment) {
    if (!Array.isArray(children))
      return renderReadableToStream_internal(state, children, el)
    return children.forEach((c) =>
      renderReadableToStream_internal(state, c, el)
    )
  }

  if (typeof type !== "string") {
    node.current = el
    try {
      if (Component.isCtor(type)) {
        el.instance = new type(props)
        return renderReadableToStream_internal(
          state,
          el.instance.render(),
          el,
          props
        )
      }
      return renderReadableToStream_internal(state, type(props), parent, props)
    } catch (value) {
      const e = Component.emitThrow(el, value)
      if (e) {
        if (e instanceof Component.ThrowableFallbackElement) {
          return renderReadableToStream_internal(state, e.element, el)
        }
        console.error("[kaioken]: error caught during render", e)
      }
    }
    return
  }

  assertValidElementProps(el)
  const isSelfClosing = selfClosingTags.includes(type)
  const attrs = Object.keys(props)
    .filter(propFilters.isProperty)
    .map(
      (k) => `${propToHtmlAttr(k)}="${propValueToHtmlAttrValue(k, props[k])}"`
    )
    .join(" ")

  state.stream.push(
    `<${type}${attrs.length ? " " + attrs : ""}${isSelfClosing ? "/>" : ">"}`
  )

  if (!isSelfClosing) {
    if ("innerHTML" in props) {
      state.stream.push(
        String(
          Signal.isSignal(props.innerHTML)
            ? props.innerHTML.value
            : props.innerHTML
        )
      )
    } else {
      if (Array.isArray(children)) {
        children.forEach((c) => renderReadableToStream_internal(state, c, el))
      } else {
        renderReadableToStream_internal(state, children, el)
      }
    }

    state.stream.push(`</${type}>`)
  }
}
