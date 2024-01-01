import { useState, useEffect, createElement } from "../src"
import { isVNode } from "./utils"
import type { Rec } from "./types"

interface RouterProps {
  basePath?: string
  children?: JSX.Element[]
}

export function Router({ basePath = "", children = [] }: RouterProps) {
  const [route, setRoute] = useState(basePath + window.location.pathname)

  useEffect(() => {
    const handler = () => {
      setRoute(basePath + window.location.pathname)
    }
    window.addEventListener("popstate", handler)

    return () => {
      window.removeEventListener("popstate", handler)
    }
  }, [])

  for (const child of children) {
    if (isVNode(child)) {
      child.props.path = basePath + child.props.path
      const match = matchPath(route, child.props.path)
      if (match.routeMatch) {
        return createElement(
          "x-router",
          {},
          child.props.element({ params: match.params, query: match.query })
        )
      }
    }
  }

  return null
}

type ComponentFunc = ({ params }: { params: Rec }) => JSX.Element

interface RouteProps {
  path: string
  element: ComponentFunc
}

export function Route({ path, element }: RouteProps) {
  return {
    type: "Route",
    props: {
      path,
      element,
      children: [],
    },
    hooks: [],
  }
}

export function Link({ to, children }: { to: string; children?: JSX.Element }) {
  return createElement(
    "a",
    {
      href: to,
      onClick: (e: Event) => {
        e.preventDefault()
        window.history.pushState({}, "", to)
        var popStateEvent = new PopStateEvent("popstate", { state: {} })
        dispatchEvent(popStateEvent)
      },
    },
    children
  )
}

function matchPath(
  value: string,
  routePath: string
): {
  params: any
  query: any
  routeMatch: RegExpMatchArray | null
} {
  let paramNames: any[] = []
  let query: any = {}

  const cPath: string = routePath
  let regexPath =
    cPath.replace(/([:*])(\w+)/g, (_full, _colon, name) => {
      paramNames.push(name)
      return "([^/]+)"
    }) + "(?:/|$)"

  // match query params
  const queryMatch = value.match(/\?(.*)/)
  if (queryMatch) {
    query = queryMatch[1].split("&").reduce((str, value) => {
      if (str === null) query = {}
      const [key, val] = value.split("=")
      query[key] = val
      return query
    }, null)
  }

  let params: any = {}
  let routeMatch = value.split("?")[0].match(new RegExp(regexPath))
  if (routeMatch !== null) {
    params = routeMatch.slice(1).reduce((acc, value, index) => {
      acc[paramNames[index]] = value.split("?")[0] // ensure no query params
      return acc
    }, {} as Rec)
  }
  return { params, query, routeMatch }
}
