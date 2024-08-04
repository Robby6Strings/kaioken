import { Router, Route, useState } from "kaioken"
import { Todos } from "./components/ToDos"
import { Counter } from "./components/Counter"
import { ProductPage } from "./components/Product"
import { Link } from "./components/atoms/Link"
import { GithubIcon } from "./components/GithubIcon"
import { MemoDemo } from "./MemoDemo"
import { BigListComponent } from "./components/BigList"
import { TodosWithStore } from "./components/TodosWithStore"
import { FilteredList } from "./components/FilteredList"
import { Transitions } from "./components/Transitions"
import { KeyedList } from "./components/KeyedList"
import { ContextExample } from "./components/ContextExample"
import { UseAsyncExample } from "./components/UseAsyncExample"
import { SuspenseExample } from "./components/SuspenseExample"

function Nav() {
  return (
    <nav className=" min-h-screen p-2  mb-5 h-full">
      <div className="sticky top-0 flex flex-col gap-2">
        <Link to="/">Home</Link>
        <Link to="/todos">Todos (state, model, memo)</Link>
        <Link to="/todos-with-store">Todos (with store)</Link>
        <Link to="/counter">Counter (store)</Link>
        <Link to="/query?id=1">Query (useAsync)</Link>
        <Link to="/transitions">Dialogs (transitions, portal)</Link>
        <Link to="/memo">Memo demo</Link>
        <Link to="/big-list">Large-list rendering</Link>
        <Link to="/test/123?sort=desc">Route Params / Query</Link>
        <Link to="/unhandled-route">Unhandled Route</Link>
        <Link to="/filtered-list">Filtered list</Link>
        <Link to="/keyed-list">Keyed list</Link>
        <Link to="/context">Context</Link>
        <Link to="/useAsync">useAsync</Link>
        <Link to="/suspense">Suspense</Link>
        <GithubIcon />
      </div>
    </nav>
  )
}

function Test() {
  const [show, setShow] = useState(false)
  return (
    <div>
      <Cntr />
      {show && <div>test</div>}
      <Cntr />
      <button onclick={() => setShow(!show)}>toggle</button>
    </div>
  )
}
function Cntr() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <div>{count}</div>
      <button onclick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}

export function App() {
  return (
    <>
      <Nav />
      <main className="flex items-center justify-center flex-grow w-full">
        <Router>
          <Route path="/" element={<Test />} />
          <Route path="/big-list" element={<BigListComponent />} />
          <Route path="/memo" element={<MemoDemo />} />
          <Route path="/todos" element={<Todos />} />
          <Route path="/todos-with-store" element={<TodosWithStore />} />
          <Route path="/counter" element={<Counter />} />
          <Route path="/query" element={<ProductPage />} />
          <Route path="/transitions" element={<Transitions />} />
          <Route path="/filtered-list" element={<FilteredList />} />
          <Route path="/keyed-list" element={<KeyedList />} />
          <Route path="/context" element={<ContextExample />} />
          <Route path="/useAsync" element={<UseAsyncExample />} />
          <Route path="/suspense" element={<SuspenseExample />} />
          <Route path="*" element={<h1>Uh-oh! Page not found :C</h1>} />
        </Router>
      </main>
    </>
  )
}
