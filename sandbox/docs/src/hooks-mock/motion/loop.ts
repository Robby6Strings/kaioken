import { noop } from "kaioken/utils"
import { Task } from "./types"

/*
  Copied from https://github.com/sveltejs/svelte/tree/main/packages/svelte/src/motion
  Distributed under MIT License https://github.com/sveltejs/svelte/blob/main/LICENSE.md
*/

const is_client = typeof window !== "undefined"

const request_animation_frame = is_client ? requestAnimationFrame : noop

const now = is_client ? () => performance.now() : () => Date.now()

type TaskEntry = { c: TaskCallback; f: () => void }
type TaskCallback = (now: number) => boolean | void
export type Raf = {
  /** Alias for `requestAnimationFrame`, exposed in such a way that we can override in tests */
  tick: (callback: (time: DOMHighResTimeStamp) => void) => any
  /** Alias for `performance.now()`, exposed in such a way that we can override in tests */
  now: () => number
  /** A set of tasks that will run to completion, unless aborted */
  tasks: Set<TaskEntry>
}

export const raf: Raf = {
  tick: (_: any) => request_animation_frame(_),
  now: () => now(),
  tasks: new Set(),
}

function run_tasks(now: number) {
  raf.tasks.forEach((task) => {
    if (!task.c(now)) {
      raf.tasks.delete(task)
      task.f()
    }
  })

  if (raf.tasks.size !== 0) {
    raf.tick(run_tasks)
  }
}

export function loop(callback: TaskCallback): Task {
  let task: TaskEntry

  if (raf.tasks.size === 0) {
    raf.tick(run_tasks)
  }

  return {
    promise: new Promise((fulfill) => {
      raf.tasks.add((task = { c: callback, f: fulfill }))
    }),
    abort() {
      raf.tasks.delete(task)
    },
  }
}
