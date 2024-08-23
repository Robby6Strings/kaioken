import {
  useState,
  fragment,
  useMemo,
  useEffect,
  useRef,
  useContext,
} from "kaioken"
import { useDevtoolsStore } from "../store"
import {
  getNodeName,
  isComponent,
  nodeContainsComponent,
  nodeContainsNode,
  searchMatchesItem,
} from "../utils"
import { Chevron } from "./chevron"
import { inspectComponent, KeyboardMap } from "../signal"
import { SearchContext } from "../context"

export function NodeListItem({
  node,
  traverseSiblings = true,
}: {
  node: Kaioken.VNode
  traverseSiblings?: boolean
}) {
  const { value: selectedNode, setSelectedNode } = useDevtoolsStore(
    (state) => state.selectedNode,
    (prev, next) => {
      return prev === node || next === node
    }
  )
  const [collapsed, setCollapsed] = useState(true)
  const isSelected = selectedNode === node
  const ref = useRef<HTMLElement | null>(null)
  const id = useMemo(() => {
    return crypto.randomUUID()
  }, [])
  const search = useContext(SearchContext)

  const isParentOfInspectNode = useMemo(() => {
    if (inspectComponent.value == null) return null
    return nodeContainsNode(node, inspectComponent.value)
  }, [inspectComponent.value, node])

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
            inspectComponent.value = null
            setSelectedNode(isSelected ? null : (node as any))
          }}
          className={`flex gap-2 items-center cursor-pointer mb-1 scroll-m-12 ${isSelected ? "font-medium bg-primary selected-vnode" : ""}`}
          data-id={id}
        >
          {showChildren && (
            <Chevron
              className="cursor-pointer transform"
              style={{
                transform: "rotate(" + (collapsed ? 0 : 90) + "deg)",
              }}
              onclick={(e) => {
                e.preventDefault()
                e.stopImmediatePropagation()
                inspectComponent.value = null
                setCollapsed((prev) => !prev)
              }}
            />
          )}
          <div className={showChildren ? "" : "ml-6"}>
            <span className={isSelected ? "" : "text-neutral-400"}>{"<"}</span>
            <span className={isSelected ? "" : "text-primary"}>
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
