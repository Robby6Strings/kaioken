export { mount, createElement, fragment, useEffect, useState, useRef, useReducer, useContext, createContext, createPortal, globalState, setWipNode, };
let mounted = false;
let nextUnitOfWork = undefined;
let currentRoot = undefined;
let wipRoot = undefined;
let deletions = [];
let pendingEffects = [];
let wipNode = null;
let hookIndex = -1;
function mount(appFunc, container) {
    const app = appFunc();
    app.type = appFunc;
    wipRoot = {
        dom: container,
        props: {
            children: [app],
        },
        alternate: currentRoot,
        hooks: [],
    };
    deletions = [];
    nextUnitOfWork = wipRoot;
    mounted = true;
}
function setWipNode(vNode) {
    wipNode = vNode;
    hookIndex = 0;
}
//#region hooks
function useState(initial) {
    // @ts-ignore
    if (!mounted)
        return [];
    if (!wipNode) {
        console.error("no wipNode");
        // @ts-ignore
        return;
    }
    const wn = wipNode;
    const oldHook = wipNode.alternate &&
        wipNode.alternate.hooks &&
        wipNode.alternate.hooks[hookIndex];
    const hook = oldHook ?? { state: initial };
    const setState = (action) => {
        if (!currentRoot)
            throw new Error("currentRoot is undefined, why???");
        hook.state =
            typeof action === "function" ? action(hook.state) : action;
        wipRoot = {
            dom: wn.child.dom,
            props: wn.props,
            alternate: wn,
            hooks: [],
            type: wn.type,
        };
        nextUnitOfWork = wipRoot;
        deletions = [];
    };
    wipNode.hooks.push(hook);
    hookIndex++;
    return [hook.state, setState];
}
function useEffect(callback, deps = []) {
    if (!mounted)
        return;
    if (!wipNode) {
        console.error("no wipNode");
        return;
    }
    const oldHook = wipNode.alternate &&
        wipNode.alternate.hooks &&
        wipNode.alternate.hooks[hookIndex];
    if (oldHook?.cleanup) {
        oldHook.cleanup();
    }
    const hasChangedDeps = !oldHook ||
        deps.length === 0 ||
        (oldHook && !deps.every((dep, i) => dep === oldHook.deps[i]));
    const hook = {
        deps,
        callback,
        cleanup: undefined,
    };
    if (hasChangedDeps) {
        pendingEffects.push(() => {
            const cleanup = callback();
            if (cleanup && typeof cleanup === "function") {
                hook.cleanup = cleanup;
            }
        });
    }
    wipNode.hooks.push(hook);
    hookIndex++;
}
const refHelpers = {
    isRef: (v) => v && v.current !== undefined,
    setRef: (vNode, dom) => {
        if (refHelpers.isRef(vNode.props.ref))
            vNode.props.ref.current = dom;
    },
};
function useRef(initial) {
    if (!mounted)
        return { current: initial };
    if (!wipNode) {
        console.error("no wipNode");
        return { current: initial };
    }
    const oldHook = wipNode.alternate &&
        wipNode.alternate.hooks &&
        wipNode.alternate.hooks[hookIndex];
    const hook = oldHook ?? { current: initial };
    wipNode.hooks.push(hook);
    hookIndex++;
    return hook;
}
function useReducer(reducer, initial) {
    if (!mounted)
        return [initial, () => initial];
    if (!wipNode) {
        console.error("no wipNode");
        return [initial, () => initial];
    }
    const wn = wipNode;
    const oldHook = wipNode.alternate &&
        wipNode.alternate.hooks &&
        wipNode.alternate.hooks[hookIndex];
    const hook = oldHook ?? { state: initial };
    const dispatch = (action) => {
        if (!currentRoot)
            throw new Error("currentRoot is undefined, why???");
        hook.state = reducer(hook.state, action);
        wipRoot = {
            dom: wn.child.dom,
            props: wn.props,
            alternate: wn,
            hooks: [],
            type: wn.type,
        };
        nextUnitOfWork = wipRoot;
        deletions = [];
    };
    wipNode.hooks.push(hook);
    hookIndex++;
    return [hook.state, dispatch];
}
function useContext(context) {
    if (!mounted)
        return {};
    if (!wipNode) {
        throw new Error("no wipNode");
    }
    const oldHook = wipNode.alternate &&
        wipNode.alternate.hooks &&
        wipNode.alternate.hooks[hookIndex];
    const hook = oldHook ?? { state: context.value() };
    wipNode.hooks.push(hook);
    hookIndex++;
    return hook.state;
}
//#endregion
function createContext(initial) {
    let context = initial;
    return {
        Provider: ({ value, children = [] }) => {
            context = value;
            return fragment({ children });
        },
        value: () => context,
    };
}
function createPortal(element, container) {
    const el = element;
    return {
        type: container.nodeName,
        props: {
            children: [el],
        },
        dom: container,
        hooks: [],
        parent: undefined,
    };
}
function fragment({ children = [], }) {
    return {
        type: "x-fragment",
        props: {
            children: children
                .flat()
                .map((child) => typeof child === "object" ? child : createTextElement(String(child))),
        },
        hooks: [],
    };
}
function createElement(type, props = {}, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children
                .flat()
                .map((child) => typeof child === "object" ? child : createTextElement(String(child))),
        },
        hooks: [],
    };
}
function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        },
        hooks: [],
    };
}
const filters = {
    internalProps: ["children", "ref"],
    isEvent: (key) => key.startsWith("on"),
    isProperty: (key) => !filters.internalProps.includes(key) && !filters.isEvent(key),
    isNew: (prev, next) => (key) => prev[key] !== next[key],
    isGone: (_prev, next) => (key) => !(key in next),
};
function createDom(vNode) {
    const dom = vNode.type == "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(vNode.type);
    updateDom(dom, {}, vNode.props, vNode);
    return dom;
}
function updateDom(dom, prevProps, nextProps = {}, vNode) {
    //Remove old or changed event listeners
    Object.keys(prevProps)
        .filter(filters.isEvent)
        .filter((key) => !(key in nextProps) || filters.isNew(prevProps, nextProps)(key))
        .forEach((name) => {
        const eventType = name.toLowerCase().substring(2);
        dom.removeEventListener(eventType, prevProps[name]);
    });
    // Remove old properties
    Object.keys(prevProps)
        .filter(filters.isProperty)
        .filter(filters.isGone(prevProps, nextProps))
        .forEach((name) => {
        // @ts-ignore
        dom[name] = "";
    });
    // Set new or changed properties
    Object.keys(nextProps)
        .filter(filters.isProperty)
        .filter(filters.isNew(prevProps, nextProps))
        .forEach((name) => {
        // @ts-ignore
        dom[name] = nextProps[name];
    });
    // Add event listeners
    Object.keys(nextProps)
        .filter(filters.isEvent)
        .filter(filters.isNew(prevProps, nextProps))
        .forEach((name) => {
        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, nextProps[name]);
    });
    refHelpers.setRef(vNode, dom);
}
function commitRoot() {
    deletions.forEach(commitWork);
    commitWork(wipRoot?.child);
    currentRoot = wipRoot;
    while (pendingEffects.length)
        pendingEffects.shift()?.();
    wipRoot = undefined;
}
function commitWork(vNode) {
    if (!vNode) {
        return;
    }
    let domParentNode = vNode.parent ?? vNode.alternate?.parent ?? wipRoot;
    let domParent = domParentNode?.dom;
    while (domParentNode && !domParent) {
        domParentNode = domParentNode.parent ?? domParentNode.alternate?.parent;
        domParent = domParentNode?.dom ?? domParentNode?.alternate?.dom;
    }
    if (!domParent) {
        console.error("no domParent");
        return;
    }
    if (vNode.effectTag === "PLACEMENT" && vNode.dom != null) {
        let sibling = vNode.parent?.sibling?.child?.dom;
        if (!sibling) {
            const { idx } = getMountLocation(vNode);
            sibling = domParent.childNodes[idx > 0 ? idx : 0];
        }
        if (sibling && domParent.contains(sibling)) {
            domParent.insertBefore(vNode.dom, sibling);
        }
        else {
            domParent.appendChild(vNode.dom);
        }
        //domParent.appendChild(vNode.dom)
    }
    else if (vNode.effectTag === "UPDATE" && vNode.dom != null) {
        updateDom(vNode.dom, vNode.alternate?.props ?? {}, vNode.props, vNode);
    }
    else if (vNode.effectTag === "DELETION") {
        commitDeletion(vNode, domParent);
        return;
    }
    commitWork(vNode.child);
    commitWork(vNode.sibling);
}
function commitDeletion(vNode, domParent) {
    if (vNode.dom) {
        refHelpers.setRef(vNode, null);
        domParent.removeChild(vNode.dom);
    }
    else if (vNode.child) {
        commitDeletion(vNode.child, domParent);
    }
}
function workLoop(deadline) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }
    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }
    requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);
function performUnitOfWork(vNode) {
    const isFunctionComponent = vNode.type instanceof Function;
    if (isFunctionComponent) {
        updateFunctionComponent(vNode);
    }
    else {
        updateHostComponent(vNode);
    }
    if (vNode.child) {
        return vNode.child;
    }
    let nextNode = vNode;
    while (nextNode) {
        if (nextNode.sibling) {
            return nextNode.sibling;
        }
        nextNode = nextNode.parent;
    }
    return;
}
function updateFunctionComponent(vNode) {
    wipNode = vNode;
    hookIndex = 0;
    wipNode.hooks = [];
    const children = [vNode.type(vNode.props)];
    // for (const c of children) {
    //   if (c === null) debugger
    // }
    reconcileChildren(vNode, children);
}
function updateHostComponent(vNode) {
    if (!vNode.dom) {
        vNode.dom = createDom(vNode);
    }
    reconcileChildren(vNode, vNode.props.children);
}
function reconcileChildren(vNode, children) {
    let index = 0;
    let oldNode = vNode.alternate && vNode.alternate.child;
    let prevSibling = undefined;
    while (index < children.length || oldNode != null) {
        const child = children[index];
        let newNode = undefined;
        const sameType = oldNode && child && child.type == oldNode.type;
        if (sameType) {
            newNode = {
                type: oldNode.type,
                props: child.props,
                dom: oldNode.dom,
                parent: vNode,
                alternate: oldNode,
                effectTag: "UPDATE",
                hooks: oldNode.hooks,
            };
        }
        if (child && !sameType) {
            newNode = {
                type: child.type,
                props: child.props,
                dom: undefined,
                parent: vNode,
                alternate: undefined,
                effectTag: "PLACEMENT",
                hooks: [],
            };
        }
        if (oldNode && !sameType) {
            oldNode.effectTag = "DELETION";
            deletions.push(oldNode);
        }
        if (oldNode) {
            oldNode = oldNode.sibling;
        }
        if (index === 0) {
            vNode.child = newNode;
        }
        else if (child && prevSibling) {
            prevSibling.sibling = newNode;
        }
        prevSibling = newNode;
        index++;
    }
}
//#region utils
function getMountLocation(vNode, start = -1) {
    if (!vNode.parent)
        return { element: null, idx: -1 };
    for (let i = 0; i < vNode.parent.props.children.length; i++) {
        const c = vNode.parent.props.children[i];
        if (vNode === c) {
            break;
        }
        start += getRenderedNodeCount(c);
    }
    if (vNode.parent.dom)
        return { element: vNode.parent.dom, idx: start };
    return getMountLocation(vNode.parent, start);
}
function getRenderedNodeCount(vNode) {
    if (!vNode)
        return 0;
    if (vNode.props.children.length === 0)
        return 1;
    return vNode.props.children.reduce((acc, c) => acc + getRenderedNodeCount(c), 0);
}
function globalState() {
    return {
        mounted,
        nextUnitOfWork,
        currentRoot,
        wipRoot,
        deletions,
        pendingEffects,
        wipNode,
        hookIndex,
    };
}
//#endregion
