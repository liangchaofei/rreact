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
// 记录时间切片的起始值，时间戳
let startTime = -1;
//标记task的唯一性
let taskIdCounter = 1;
// 任务池，最小堆
const taskQueue: Array<Task> = []; // 没有延迟的任务
// 锁
// 是否有 work 在执行
let isPerformingWork = false;

let currentTask: Task | null = null;
let currentPriorityLevel: PriorityLevel = NoPriority;
// 主线程是否在调度
let isHostCallbackScheduled = false;

let isMessageLoopRunning = false;

function scheduleCallback(
  priorityLevel: PriorityLevel,
  callback: Callback,
  options?: { delay: number }
) {
  console.log(1);
  const currentTime = getCurrentTime();
  let startTime;

  let timeout: number;
  switch (priorityLevel) {
    case NormalPriority:
    default:
      timeout = normalPriorityTimeout;
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
    console.log("priorityLevel1", priorityLevel);
  } else {
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);

    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback();
    }
  }
}

function requestHostCallback() {
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
}

function workLoop(initialTime: number) {
  let currentTime = initialTime;

  currentTask = peek(taskQueue);

  console.log("currentTask", currentTask);
}

function advanceTimers(currentTime: number) {
  // let timer = peek(timerQueue)
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

function performWorkUntilDeadline() {
  if (isMessageLoopRunning) {
    const currentTime = getCurrentTime();
    startTime = currentTime;
    let hasMoreWork = true;
    try {
      // hasMoreWork = flushWork(currentTime);
    } finally {
    }
  }
}

const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;
function schedulePerformWorkUntilDeadline() {
  port.postMessage(null);
}

export { scheduleCallback };
