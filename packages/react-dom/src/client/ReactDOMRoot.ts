import type { Container, FiberRoot } from "r-reconciler/src/ReactInternalTypes";
import type { ReactNodeList } from "shared/ReactTypes";
import { createFiberRoot } from "r-reconciler/src/ReactFiberRoot";
import { updateContainer } from "r-reconciler/src/ReactFiberReconciler";
type RootType = {
  render: (children: ReactNodeList) => void;
  _internalRoot: FiberRoot;
};

function ReactDOMRoot(_internalRoot: FiberRoot) {
  this._internalRoot = _internalRoot;
}

ReactDOMRoot.prototype.render = function (children: ReactNodeList) {
  updateContainer(children, this._internalRoot);
};

export function createRoot(container: Container): RootType {
  const root: FiberRoot = createFiberRoot(container);
  return new ReactDOMRoot(root);
}

export default {
  createRoot,
};
