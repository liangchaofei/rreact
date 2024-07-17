import type { Fiber, FiberRoot } from "./ReactInternalTypes";
import { ensureRootIsScheduled } from "./ReactFiberRootScheduler";
import { createWorkInProgress } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";

type ExecutionContext = number;

export const NoContext = /*             */ 0b000;
export const RenderContext = /*         */ 0b010;
// Describes where we are in the React execution stack
let executionContext: ExecutionContext = NoContext;

let workInProgress: Fiber | null = null;
let workInProgressRoot: FiberRoot | null = null;

export function scheduleUpdateOnFiber(root: FiberRoot, fiber: Fiber) {
  workInProgressRoot = root;
  workInProgress = fiber;
  ensureRootIsScheduled(root);
}

export function performConcurrentWorkOnRoot(root: FiberRoot) {
  renderRootSync(root);
  console.log(
    "%c [  ]-31",
    "font-size:13px; background:pink; color:#bf2c9f;",
    root
  );
}

function renderRootSync(root: FiberRoot) {
  const prevExecutionContext = executionContext;
  executionContext |= RenderContext;

  prepareFreshStack(root);

  workLoopSync();
}

function prepareFreshStack(root: FiberRoot) {
  root.finishedWork = null;
  workInProgressRoot = root;
  const rootWorkInProgress = createWorkInProgress(root.current, null);
  if (workInProgress !== null) {
    workInProgress = rootWorkInProgress;
  }
  console.log("workInProgress5566", workInProgress);
  return workInProgress;
}
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork: Fiber) {
  const current = unitOfWork.alternate;
  console.log("current22", current);
  let next = beginWork(current, unitOfWork);
}
