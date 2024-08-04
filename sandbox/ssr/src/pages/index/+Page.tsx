//import { useState } from "kaioken"

import { SuspenseExample } from "$/components/SuspenseExample"
import { signal } from "kaioken"

const key = signal(0)
export function Page() {
  return (
    <div>
      <h1>Hello world !</h1>
      <p>
        <button onclick={() => key.value++}>Click me {key.value}</button>
      </p>
      <SuspenseExample />
    </div>
  )
}
