import type { Fiber } from "./ReactInternalTypes";
import { HostRoot } from "./ReactWorkTags";
import { mountChildFibers } from "./ReactChildFiber";

export function beginWork(
  current: Fiber | null,
  workInProgress: Fiber
): Fiber | null {
  console.log("workInProgress666", workInProgress);
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(current, workInProgress);
  }
  throw new Error(
    `Unknown unit of work tag (${workInProgress.tag}). This error is likely caused by a bug in ` +
      "React. Please file an issue."
  );
}

function updateHostRoot(current: Fiber | null, workInProgress: Fiber) {
  const nextChildren = workInProgress.memoizedState.element;
  reconcileChildren(current, workInProgress, nextChildren);
  if (current) {
    current.child = workInProgress.child;
  }

  return workInProgress.child;
}

function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any
) {
  console.log("current333", current);
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
  }
}
