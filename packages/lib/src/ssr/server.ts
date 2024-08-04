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

export { renderToStream }

type RequestState = {
  stream: Readable
  ctx: AppContext
}

function renderToStream<T extends Record<string, unknown>>(
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
  renderToStream_internal(state, state.ctx.rootNode, undefined, elProps)

  state.stream.push(null)
  renderMode.current = prev
  ctx.current = prevCtx

  return state.stream
}

function renderToStream_internal(
  state: RequestState,
  el: unknown,
  parent?: Kaioken.VNode | undefined,
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
    renderToStream_internal(state, createElement(el, elProps), parent)
    return
  }
  if (el instanceof Array) {
    el.forEach((c) => renderToStream_internal(state, c, parent))
    return
  }
  if (Signal.isSignal(el)) {
    renderToStream_internal(state, el.value, parent)
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
      return renderToStream_internal(state, children, el)
    return children.forEach((c) => renderToStream_internal(state, c, el))
  }

  if (typeof type !== "string") {
    node.current = el
    if (Component.isCtor(type)) {
      el.instance = new type(props)
      return renderToStream_internal(state, el.instance.render(), parent, props)
    }
    return renderToStream_internal(state, type(props), parent, props)
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
        children.forEach((c) => renderToStream_internal(state, c, el))
      } else {
        renderToStream_internal(state, children, el)
      }
    }

    state.stream.push(`</${type}>`)
  }
}
