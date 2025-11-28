/**
 * Promise.reject(): 返回一个失败的promise状态的Promise。
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
  //让then函数返回的Promise成功
  resolve: ComFn;
  //让then函数返回的Promise失败
  reject: ComFn;
}

export class MyPromise {
  private state: StateEnum = StateEnum.pending;
  private data: any;
  private executorQueue: ExecutorQueueType[] = [];
  constructor(executor: (_resolve: ComFn, _reject: ComFn) => void) {
    try {
      executor(this._reslove.bind(this), this._reject.bind(this));
    } catch (error) {
      this._reject(error);
    }
  }
  /**
   * 标记当前任务完成
   * @param {any} data 任务完成的相关数据
   */
  private _reslove(data?: any) {
    this.changeState(StateEnum.fulfilled, data);
  }
  /**
   * 标记当前任务失败
   * @param {any} reason 任务失败的相关数据
   */
  private _reject(msg?: any) {
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
            // 无论上一个是fulfill状态还是reject状态。都是调用最新的promise任务标记为完成
            result.then(resolve);
          } else {
            // 只要是函数
            resolve(result);
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 处理异步操作的Promise方法 用于注册Promise的成功和失败回调
   * @param {(OnReslveType | any)} [onReslve] Promise成功时的回调函数
   * @param {(OnRejectType | any)} [onReject]
   * @return {*}
   * @memberof MyPromise
   */
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

  finally(fn: () => any) {
    return this.then(
      (data: any) => {
        fn();
        return data;
      },
      (data: any) => {
        fn();
        return data;
      }
    );
  }
  /**
   *返回一个完成的promise
   * @param {*} [data]
   * @memberof MyPromise
   */
  static resolve(data?: any) {
    if (data instanceof MyPromise) {
      return data;
    }
    return new MyPromise((reslove, rej) => {
      if (isPromise(data)) {
        return data.then(reslove, rej);
      } else {
        return reslove(data);
      }
    });
  }
  /**
   *返回一个失败的promise状态的Promise。
   * @param {*} [data]
   * @memberof MyPromise
   */
  static reject(data?: any) {
    return new MyPromise((res, rej) => {
      rej(data);
    });
  }
}

const p1 = MyPromise.reject("----->");

const p2 = p1.then(
  (data: any) => {
    console.log("data", data);
  },
  (err: any) => {
    console.log("err", err);
  }
);
console.log("p1->", p1);
console.log("p2->", p2);
setTimeout(() => {
  console.log("-------------");
  console.log("p1->", p1);
  console.log("p2->", p2);
}, 0);
