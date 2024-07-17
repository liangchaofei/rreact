// ! 实现一个单线程任务调度器
import { getCurrentTime } from "shared/utils";
import { peek, pop, push } from "./SchedulerMinHeap";
import {
  PriorityLevel,
  NormalPriority,
  NoPriority,
} from "./SchedulerPriorities";
import { normalPriorityTimeout } from "./SchedulerFeatureFlags";
type Callback = (arg: boolean) => Callback | null | undefined;

export type Task = {
  id: number;
  callback: Callback | null;
  priorityLevel: PriorityLevel;
  startTime: number;
  expirationTime: number;
  sortIndex: number;
};
// 是否有任务在倒计时
var isHostTimeoutScheduled = false;
// 记录时间切片的起始值，时间戳
let startTime = -1;
let taskTimeoutID = -1;
//标记task的唯一性
let taskIdCounter = 1;
// 任务池，最小堆
const taskQueue: Array<Task> = []; // 没有延迟的任务
const timerQueue: Array<Task> = []; // 有延迟的任务
// 锁
// 是否有 work 在执行
let isPerformingWork = false;
// 时间切片，这是个时间段
let frameInterval = 5;
let currentTask: Task | null = null;
let currentPriorityLevel: PriorityLevel = NoPriority;
// 主线程是否在调度
let isHostCallbackScheduled = false;

let isMessageLoopRunning = false;

// 任务调度器的入口函数
function scheduleCallback(
  priorityLevel: PriorityLevel,
  callback: Callback,
  options?: { delay: number }
) {
  const currentTime = getCurrentTime();
  let startTime;

  if (typeof options === "object" && options !== null) {
    let delay = options.delay;
    if (typeof delay === "number" && delay > 0) {
      // 有效的延迟时间
      startTime = currentTime + delay;
    } else {
      // 无效的延迟时间
      startTime = currentTime;
    }
  } else {
    // 无延迟
    startTime = currentTime;
  }

  // expirationTime 是过期时间，理论上的任务执行时间

  let timeout: number;
  switch (priorityLevel) {
    // case ImmediatePriority:
    //   // 立即超时，SVVVVIP
    //   timeout = -1;
    //   break;
    // case UserBlockingPriority:
    //   // 最终超时，VIP
    //   timeout = userBlockingPriorityTimeout;
    //   break;
    // case IdlePriority:
    //   // 永不超时
    //   timeout = maxSigned31BitInt;
    //   break;
    // case LowPriority:
    //   // 最终超时
    //   timeout = lowPriorityTimeout;
    //   break;
    case NormalPriority:
    default:
      timeout = normalPriorityTimeout;
      break;
  }

  const expirationTime = startTime + timeout;
  const newTask: Task = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1,
  };

  if (startTime > currentTime) {
    console.log("99999");
    // // newTask任务有延迟
    newTask.sortIndex = startTime;
    // 任务在timerQueue到达开始时间之后，就会被推入 taskQueue
    push(timerQueue, newTask);
    // 每次只倒计时一个任务
    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
      if (isHostTimeoutScheduled) {
        // newTask 才是堆顶任务，才应该最先到达执行时间，newTask应该被倒计时，但是其他任务也被倒计时了，说明有问题
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      }

      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);

    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback();
    }
  }
}

function handleTimeout(currentTime: number) {
  isHostTimeoutScheduled = false;
  //  把延迟任务从timerQueue中推入taskQueue
  advanceTimers(currentTime);

  if (!isHostCallbackScheduled) {
    if (peek(taskQueue) !== null) {
      isHostCallbackScheduled = true;
      requestHostCallback();
    } else {
      const firstTimer = peek(timerQueue);
      if (firstTimer !== null) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }
    }
  }
}

function advanceTimers(currentTime: number) {
  let timer = peek(timerQueue);
  while (timer !== null) {
    if (timer.callback === null) {
      // 无效的任务
      pop(timerQueue);
    } else if (timer.startTime <= currentTime) {
      // 有效的任务
      // 任务已经到达开始时间，可以推入taskQueue
      pop(timerQueue);
      timer.sortIndex = timer.expirationTime;
      push(taskQueue, timer);
    } else {
      return;
    }
    timer = peek(timerQueue);
  }
}
function requestHostTimeout(
  callback: (currentTime: number) => void,
  ms: number
) {
  taskTimeoutID = setTimeout(() => {
    callback(getCurrentTime());
  }, ms);
}
// delay任务处理逻辑
function cancelHostTimeout() {
  clearTimeout(taskTimeoutID);
  taskTimeoutID = -1;
}
function requestHostCallback() {
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
}

function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime;

  if (timeElapsed < frameInterval) {
    return false;
  }

  return true;
}

function workLoop(initialTime: number) {
  let currentTime = initialTime;

  currentTask = peek(taskQueue);
  console.log("currentTask", currentTask);
  while (currentTask !== null) {
    if (currentTask.expirationTime > currentTime && shouldYieldToHost()) {
      break;
    }
    // 执行任务
    const callback = currentTask.callback;
    if (typeof callback === "function") {
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      const continuationCallback = callback(didUserCallbackTimeout);
      currentTime = getCurrentTime();

      if (typeof continuationCallback === "function") {
        currentTask.callback = continuationCallback;
        return true;
      } else {
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }
    } else {
      pop(taskQueue);
    }
  }
  console.log("currentTask2", currentTask);

  if (currentTask !== null) {
    return true;
  } else {
    return false;
  }
}

function performWorkUntilDeadline() {
  if (isMessageLoopRunning) {
    const currentTime = getCurrentTime();
    // 记录了一个work的起始时间，其实就是一个时间切片的起始时间，这是个时间戳
    startTime = currentTime;
    let hasMoreWork = true;
    try {
      hasMoreWork = flushWork(currentTime);
    } finally {
      if (hasMoreWork) {
        schedulePerformWorkUntilDeadline();
      } else {
        isMessageLoopRunning = false;
      }
    }
  }
}

const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;
function schedulePerformWorkUntilDeadline() {
  port.postMessage(null);
}
function flushWork(initialTime: number) {
  isHostCallbackScheduled = false;
  isPerformingWork = true;

  let previousPriorityLevel = currentPriorityLevel;
  try {
    return workLoop(initialTime);
  } finally {
    currentTask = null;
    currentPriorityLevel = previousPriorityLevel;
    isPerformingWork = false;
  }
}
export { scheduleCallback };
