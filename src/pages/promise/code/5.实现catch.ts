/**
 * catch:
 * - 捕获它前面的异常错误（reject\throw new Error()、代码异常）：可以接多个catch,每个catch都返回一个promise，类似then.
 * - 如果前面代码then，执行了err，那么无法捕获.
 * - 注意catch回调方法、then(null, catch回调方法):回调执行完后都是fulfilled
 * */

/**--------------------------------------------------------------------------------------------------*/
/**
 * 微队列处理函数：
 * Promise A+规范(指then函数)：可以在node与浏览器中使用
 * */
function MyMicroTask(callback: () => any) {
  if (
    typeof process !== "undefined" &&
    typeof (process as any).nextTick === "function"
  ) {
    //node 环境
    (process as any).nextTick(callback);
    // console.log("node环境:queueMicrotaskprocess");
    return;
  } else if (typeof queueMicrotask === "function") {
    // node 浏览器
    queueMicrotask(callback);
    // console.log("node 浏览器环境:queueMicrotask");
    return;
  } else if (MutationObserver) {
    const p = document.createElement("p");
    const observe = new MutationObserver(callback);
    observe.observe(p, { childList: true });
    p.innerHTML = "1";
    // console.log("浏览器环境:queueMicrotask");
    return;
  } else {
    // console.log("setTimeout 兜底");
    setTimeout(callback, 0);
  }
}

/**
 * 利用promiseA+规范来判断是否使一个Promise
 * promiseA+规范： 指的使then
 * */
const isPromise = (obj: any) =>
  !!(obj && typeof obj === "object" && typeof obj?.then === "function");

enum StateEnum {
  pending = "pending",
  fulfilled = "fulfilled",
  rejected = "rejected",
}

type OnReslveType = (data?: any) => any;
type OnRejectType = (data?: any) => any;
type ComFn = (data?: any) => any;
interface ExecutorQueueType {
  /**
   * 当前promise的状态
   * */
  state: StateEnum;
  /**
   * 当前promise.then中的回调函数
   * */
  callBack?: OnReslveType | OnRejectType | any;
  /**
   * 下一个Promise 的执行方法
   * state === fulfilled：调用reslove
   * state === rejected：调用reject
   * */
  resolve: ComFn;
  reject: ComFn;
}

export class MyPromise {
  private state: StateEnum = StateEnum.pending;
  private data: any;
  private executorQueue: ExecutorQueueType[] = [];
  constructor(executor: (resolve: ComFn, reject: ComFn) => void) {
    try {
      executor(this.reslove.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }
  /**
   * 更改任务状态
   * */
  reslove(data?: any) {
    this.changeState(StateEnum.fulfilled, data);
  }
  /**
   * 更改任务状态
   * */
  reject(msg?: any) {
    this.changeState(StateEnum.rejected, msg);
  }
  /**
   * 更改任务状态函数
   * */
  private changeState(state: StateEnum, data: any) {
    if (this.state != StateEnum.pending) {
      return;
    }
    this.state = state;
    this.data = data;
    this.runExecutorQueue();
  }

  // 执行then的回调函数: 按照顺序执行
  private runExecutorQueue() {
    if (this.state === StateEnum.pending) return;
    while (this.executorQueue[0]) {
      this.runOne(this.executorQueue[0]);
      this.executorQueue.shift(0);
    }
  }

  /**
   * 处理一个then的回调函数
   * 1. callBack 为普通值、发生错误：状态与值的穿透
   * 2. callBack 为函数
   *    - 返回一个普通的值；
   *    - 返回一个Promise 对象；
   *    - 返回一个thenable值；
   * */
  private runOne(handler: ExecutorQueueType) {
    const { callBack, state, reject, resolve } = handler;
    MyMicroTask(() => {
      if (this.state != state) return;
      try {
        if (typeof callBack != "function") {
          this.state === StateEnum.fulfilled
            ? resolve(this.data)
            : reject(this.data);
          return;
        }
        if (typeof callBack === "function") {
          const result = callBack(this.data);
          if (isPromise(result)) {
            result.then(resolve, reject);
          } else if (
            typeof result === "object" &&
            result?.then &&
            typeof result?.then === "function"
          ) {
            result.then(resolve);
          } else {
            resolve(result);
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * then: 注册队列函数
   * */
  then(onReslve?: OnReslveType | any, onReject?: OnRejectType | any) {
    return new MyPromise((resolve: ComFn, reject: ComFn) => {
      /**
       * 注意这里的this: 箭头函数->外层->所以是then的this
       * 上层的状态、错误捕获，决定下一个promise的执行，所以要用上一个的this
       * */
      this.executorQueue.push({
        state: StateEnum.fulfilled,
        callBack: onReslve,
        resolve,
        reject,
      });
      this.executorQueue.push({
        state: StateEnum.rejected,
        callBack: onReject,
        resolve,
        reject,
      });
      this.runExecutorQueue();
    });
  }

  catch(onReject?: OnRejectType) {
    return this.then(null, onReject);
  }
}

const p1 = new MyPromise((res, rej) => {
  setTimeout(() => {
    // res("p1");
    rej("p1 rej");
  }, 0);
});
/**
 * callBack 为函数  返回一个Promise；
 * */
const p2 = p1.then(
  (data: any) => {
    console.log("data", data);
    return new Promise((res, rej) => {
      res("p2 rej");
    });
  },
  (err: any) => {
    console.log(err);
  }
);

const p3 = p2.catch((err) => {
  console.log("err-->", err);
});

setTimeout(() => {
  console.log("p1", p1);
  console.log("p2", p2);
  console.log("p3", p3);
}, 1000);
