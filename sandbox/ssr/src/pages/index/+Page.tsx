import { Counter } from "$/components/Counter"
import { PageTitle } from "$/components/PageTitle"
import { SuspenseExample } from "$/components/SuspenseExample"

export function Page() {
  return (
    <div>
      <PageTitle>Home</PageTitle>
      <Counter />
      <SuspenseExample />
    </div>
  )
}
