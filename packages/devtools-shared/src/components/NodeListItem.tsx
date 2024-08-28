import {
  useState,
  fragment,
  useMemo,
  useEffect,
  useRef,
  useSyncExternalStore,
  useCallback,
} from "kaioken"
import { Chevron } from "../icons/Chevron"
import {
  getNodeName,
  isComponent,
  nodeContainsComponent,
  nodeContainsNode,
  searchMatchesItem,
} from "../utils"
import { KeyboardMap } from "../keyboardMap"
import { useSearch } from "../searchContext"
import { useDevtools } from "../store"

const dt = useDevtools()

export function NodeListItem({
  node,
  traverseSiblings = true,
}: {
  node: Kaioken.VNode
  traverseSiblings?: boolean
}) {
  const dtSub = useCallback(dt.subscribe.bind(dt), [])
  const dtGet = useCallback(dt.peek.bind(dt), [])
  const dtStore = useSyncExternalStore(dtSub, dtGet)
  const [collapsed, setCollapsed] = useState(true)
  const isSelected = dtStore.selectedNode === node
  const ref = useRef<HTMLElement | null>(null)
  const id = useMemo(() => {
    return crypto.randomUUID()
  }, [])
  const search = useSearch()

  const isParentOfInspectNode = useMemo(() => {
    if (dtStore.inspectNode == null) return null
    return nodeContainsNode(node, dtStore.inspectNode)
  }, [dtStore.inspectNode, node])

  useEffect(() => {
    if (isParentOfInspectNode) {
      setCollapsed(false)
    }
  }, [isParentOfInspectNode])

  useEffect(() => {
    if (!node || !isComponent(node)) return

    KeyboardMap.value.set(id, {
      vNode: node,
      setCollapsed,
    })

    return () => {
      KeyboardMap.value.delete(id)
    }
  })

  if (!node) return null
  if (
    !isComponent(node) ||
    (search.length > 0 &&
      !searchMatchesItem(search.toLowerCase().split(""), node.type.name))
  )
    return (
      <>
        {node.child && <NodeListItem node={node.child} />}
        {traverseSiblings && <NodeListItemSiblings node={node} />}
      </>
    )

  const showChildren = node.child && nodeContainsComponent(node.child)
  return (
    <>
      <div className="pl-4 mb-1">
        <h2
          ref={ref}
          onclick={() => {
            dt.value.inspectNode = null
            dt.value.selectedNode = isSelected ? null : (node as any)
            dt.notify()
          }}
          className={`flex gap-2 items-center cursor-pointer mb-1 scroll-m-12 ${isSelected ? "font-medium bg-crimson selected-vnode" : ""}`}
          data-id={id}
        >
          {showChildren && (
            <Chevron
              className={`cursor-pointer transition ${
                collapsed ? "" : "rotate-90"
              }`}
              onclick={(e) => {
                e.preventDefault()
                e.stopImmediatePropagation()
                dt.value.inspectNode = null
                dt.notify()
                setCollapsed((prev) => !prev)
              }}
            />
          )}
          <div className={showChildren ? "" : "ml-6"}>
            <span className={isSelected ? "" : "text-neutral-400"}>{"<"}</span>
            <span className={isSelected ? "" : "text-crimson"}>
              {getNodeName(node)}
            </span>
            <span className={isSelected ? "" : "text-neutral-400"}>{">"}</span>
          </div>
        </h2>
        {(!collapsed && node.child) ||
        (isParentOfInspectNode != null &&
          isParentOfInspectNode &&
          node.child) ? (
          <NodeListItem node={node.child} />
        ) : null}
      </div>
      {traverseSiblings && <NodeListItemSiblings node={node} />}
    </>
  )
}
function NodeListItemSiblings({ node }: { node?: Kaioken.VNode }) {
  if (!node) return null
  let nodes = []
  let n: Kaioken.VNode | undefined = node.sibling
  while (n) {
    nodes.push(n)
    n = n.sibling
  }
  return fragment({
    children: nodes.map((n) => (
      <NodeListItem node={n} traverseSiblings={false} />
    )),
  })
}
