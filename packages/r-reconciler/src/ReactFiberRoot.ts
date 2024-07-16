import type { Container, FiberRoot, Fiber } from "./ReactInternalTypes";
import { HostRoot } from "./ReactWorkTags";
import { createFiber } from "./ReactFiber";

export function createFiberRoot(containerInfo: Container): FiberRoot {
  const root: FiberRoot = new FiberRootNode(containerInfo);
  const uninitializedFiber: Fiber = createFiber(HostRoot, null, null);
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;
  return root;
}

export function FiberRootNode(containerInfo: Container) {
  this.containerInfo = containerInfo;
  this.current = null;
}
