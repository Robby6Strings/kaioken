import { Signal, signal, useCallback, memo } from "kaioken"

const random = (max: number) => Math.round(Math.random() * 1000) % max

const A = [
  "pretty",
  "large",
  "big",
  "small",
  "tall",
  "short",
  "long",
  "handsome",
  "plain",
  "quaint",
  "clean",
  "elegant",
  "easy",
  "angry",
  "crazy",
  "helpful",
  "mushy",
  "odd",
  "unsightly",
  "adorable",
  "important",
  "inexpensive",
  "cheap",
  "expensive",
  "fancy",
]
const C = [
  "red",
  "yellow",
  "blue",
  "green",
  "pink",
  "brown",
  "purple",
  "brown",
  "white",
  "black",
  "orange",
]
const N = [
  "table",
  "chair",
  "house",
  "bbq",
  "desk",
  "car",
  "pony",
  "cookie",
  "sandwich",
  "burger",
  "pizza",
  "mouse",
  "keyboard",
]

let nextId = 1

const buildData = (count: number) => {
  return Array.from({ length: count }, () => {
    return {
      id: signal(nextId++),
      label: signal(
        `${A[random(A.length)]} ${C[random(C.length)]} ${N[random(N.length)]}`
      ),
    }
  })
}

type AppState = {
  data: {
    id: Kaioken.Signal<number>
    label: Kaioken.Signal<string>
  }[]
  selected: number
}

type AppAction = {
  type: string
  id?: number
}

type RowProp = {
  item: AppState["data"][number]
  selected: boolean
  dispatch: (action: AppAction) => void
  key: number
}
const Row = memo<RowProp>(
  ({ selected, item, dispatch, key }) => {
    return (
      <div onclick={() => dispatch({ type: "SELECT", id: item.id.value })}>
        {item.label}
      </div>
    )
  },
  (prevProps, nextProps) => {
    return prevProps.key === nextProps.key
  }
)

const Button: Kaioken.FC<{ id: string; cb: () => void; title: string }> = ({
  id,
  cb,
  title,
}) => (
  <div className="col-sm-6 smallpad">
    <button
      type="button"
      className="btn btn-primary btn-block"
      id={id}
      onclick={cb}
    >
      {title}
    </button>
  </div>
)

const Jumbotron = memo<{
  onCreate: () => void
  onCreate10k: () => void
  onAdd: () => void
  onUpdate10th: () => void
  onClear: () => void
  onSwap: () => void
}>(
  ({ onCreate, onCreate10k, onAdd, onUpdate10th, onClear, onSwap }) => (
    <div className="jumbotron">
      <div className="row">
        <div className="col-md-6">
          <h1>Kaioken Signals keyed</h1>
        </div>
        <div className="col-md-6">
          <div className="row">
            <Button id="run" title="Create 1,000 rows" cb={onCreate} />
            <Button id="runlots" title="Create 10,000 rows" cb={onCreate10k} />
            <Button id="add" title="Append 1,000 rows" cb={onAdd} />
            <Button
              id="update"
              title="Update every 10th row"
              cb={onUpdate10th}
            />
            <Button id="clear" title="Clear" cb={onClear} />
            <Button id="swaprows" title="Swap Rows" cb={onSwap} />
          </div>
        </div>
      </div>
    </div>
  ),
  () => true
)

export const App = () => {
  const data = signal<AppState["data"]>([])
  const selected = signal(0)

  const createRows = useCallback(() => {
    data.value = buildData(2)
    selected.value = 0
  }, [])

  const create10kRows = useCallback(() => {
    data.value = buildData(10000)
    selected.value = 0
  }, [])

  const addRows = useCallback(() => {
    data.value.push(...buildData(1000))
    data.notify()
  }, [])

  const update10thRow = useCallback(() => {
    for (let i = 0; i < data.value.length; i += 10) {
      data.value[i].label.value += " !!!"
    }
  }, [])

  const clear = useCallback(() => {
    data.value = []
    selected.value = 0
  }, [])

  const swapRows = useCallback(() => {
    if (data.value.length > 0) {
      const d1 = {
        id: data.value[0].id.value,
        label: data.value[0].label.value,
      }
      const d998 = {
        id: data.value[1].id.value,
        label: data.value[1].label.value,
      }

      data.value[0].id.value = d998.id
      data.value[0].label.value = d998.label
      data.value[1].id.value = d1.id
      data.value[1].label.value = d1.label
      console.log("has swapped")
    }
    data.notify()
  }, [])

  //  console.log(data.value)

  return (
    <div className="container">
      <Jumbotron
        onCreate={createRows}
        onCreate10k={create10kRows}
        onAdd={addRows}
        onUpdate10th={update10thRow}
        onClear={clear}
        onSwap={swapRows}
      />
      <table className="table table-hover table-striped test-data">
        <tbody>
          {data.value.map((item) => {
            const idValue = Signal.getValue(item.id)

            return (
              <Row
                key={idValue}
                item={item}
                selected={selected.value === idValue}
                dispatch={() => {}}
              />
            )
          })}
        </tbody>
      </table>
      <span
        className="preloadicon glyphicon glyphicon-remove"
        aria-hidden="true"
      />
    </div>
  )
}
