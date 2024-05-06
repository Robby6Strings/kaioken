import { Readable } from "node:stream"
import { Component, createElement } from "../index.js"
import { AppContext } from "../appContext.js"
import { renderMode, ctx, node, contexts, nodeToCtxMap } from "../globals.js"
import {
  encodeHtmlEntities,
  propFilters,
  propToHtmlAttr,
  propValueToHtmlAttrValue,
  selfClosingTags,
} from "../utils.js"
import { Signal } from "../signal.js"
import { elementTypes as et } from "../constants.js"
import { assertValidElementProps } from "../props.js"

export { renderToStream }

type VNode = Kaioken.VNode

function renderToStream<T extends Record<string, unknown>>(
  el: (props: T) => JSX.Element,
  elProps = {} as T
): Readable {
  const stream = new Readable({
    objectMode: true,
  })
  const prev = renderMode.current
  renderMode.current = "string"
  const c = (ctx.current = new AppContext(el, elProps))
  c.rootNode = el instanceof Function ? createElement(el, elProps) : el
  renderToStream_internal(stream, c.rootNode, undefined, elProps)
  contexts.splice(contexts.indexOf(c), 1)
  renderMode.current = prev
  stream.push(null)
  return stream
}

function renderToStream_internal<T extends Record<string, unknown>>(
  stream: Readable,
  el: JSX.Element,
  parent?: VNode | undefined,
  elProps = {} as T
): void {
  if (el === null) return
  if (el === undefined) return
  switch (typeof el) {
    case "boolean":
      return
    case "string":
      return pushToReadable(stream, encodeHtmlEntities(el))
    case "number":
      return pushToReadable(stream, encodeHtmlEntities(el.toString()))
    case "function":
      return renderToStream_internal(stream, createElement(el, elProps))
  }

  if (el instanceof Array) {
    return el.forEach((c) =>
      renderToStream_internal(stream, c, parent, elProps)
    )
  }
  if (Signal.isSignal(el))
    return pushToReadable(stream, encodeHtmlEntities(el.value.toString()))

  el.parent = parent
  nodeToCtxMap.set(el, ctx.current)
  const props = el.props ?? {}
  const children = props.children ?? []
  const type = el.type
  if (type === et.text)
    return pushToReadable(stream, encodeHtmlEntities(props.nodeValue ?? ""))
  if (type === et.fragment) {
    children.forEach((c) => renderToStream_internal(stream, c, el, props))
    return
  }

  if (typeof type === "string") {
    assertValidElementProps(el)
    const isSelfClosing = selfClosingTags.includes(type)
    const attrs = Object.keys(props)
      .filter(propFilters.isProperty)
      .map(
        (k) => `${propToHtmlAttr(k)}="${propValueToHtmlAttrValue(k, props[k])}"`
      )
      .join(" ")

    pushToReadable(stream, `<${type} ${attrs}${isSelfClosing ? "/>" : ">"}`)

    if (!isSelfClosing) {
      if ("innerHTML" in props) {
        pushToReadable(
          stream,
          String(
            Signal.isSignal(props.innerHTML)
              ? props.innerHTML.value
              : props.innerHTML
          )
        )
      } else {
        children.forEach((c) => renderToStream_internal(stream, c, el, c.props))
      }

      pushToReadable(stream, `</${type}>`)
    }

    return
  }

  node.current = el
  if (Component.isCtor(type)) {
    const instance = new (type as unknown as {
      new (props: Record<string, unknown>): Component
    })(props)
    return renderToStream_internal(stream, instance.render(), el, props)
  }

  return renderToStream_internal(stream, type(props), el, props)
}

function pushToReadable(stream: Readable, value: string): void {
  stream.push(value)
}
