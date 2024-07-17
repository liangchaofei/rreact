import type { ReactNodeList } from "shared/ReactTypes";
import type { FiberRoot } from "./ReactInternalTypes";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";

export function updateContainer(element: ReactNodeList, container: FiberRoot) {
  // ! 1. 获取current
  let current = container.current;
  current.memoizedState = { element };
  console.log("555", current);
  // ! 2. 调度更新
  scheduleUpdateOnFiber(container, current);
}
