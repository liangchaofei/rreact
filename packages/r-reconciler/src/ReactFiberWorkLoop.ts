import type { Fiber, FiberRoot } from "./ReactInternalTypes";
import { ensureRootIsScheduled } from "./ReactFiberRootScheduler";

export function scheduleUpdateOnFiber(root: FiberRoot, fiber: Fiber) {
  ensureRootIsScheduled(root);
}

export function performConcurrentWorkOnRoot(root: FiberRoot) {
  console.log(
    "%c [  ]-31",
    "font-size:13px; background:pink; color:#bf2c9f;",
    root
  );
}
