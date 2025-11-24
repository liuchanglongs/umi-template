/**
 * 思考实现任何一个函数：
 * - 参数咋传递：两个参数 onreslve, onreject
 * - 返回值是啥:新的promise
 * - 这个函数做啥:
 *     - 回调函数不会马上执行，会在微队列中执行咋注册函数？
 *     - 怎么注册这两个回调函数：创建执行队列
 * */

/**
 * 微队列处理函数：
 * Promise A+规范：可以在node与浏览器中使用
 * */
function MmMicroTask(callback: () => any) {
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
  }

  /**
   * then: 注册队列函数
   * */
  then(onReslve?: OnReslveType | any, onReject?: OnRejectType | any) {
    console.log(this);
    return new MyPromise((resolve: ComFn, reject: ComFn) => {
      /**
       * 注意这里的this: 箭头函数->外层->所以是then的this
       * 上层的状态、错误捕获，决定下一个promise的执行，所以要用上一个的this
       * */
      this.executorQueue.push({
        state: this.state,
        callBack: onReslve,
        resolve,
        reject,
      });
      this.executorQueue.push({
        state: this.state,
        callBack: onReject,
        resolve,
        reject,
      });
    });
  }
}

// 例子1：添加的队列全放在p中
// const p = new MyPromise((res, rej) => {
//   res("res");
// });
// p.then(
//   () => {
//     console.log("A1");
//   },
//   () => {
//     console.log("A2");
//   }
// );
// p.then(
//   () => {
//     console.log("B1");
//   },
//   () => {
//     console.log("B2");
//   }
// );
// setTimeout(() => {
//   console.log("p:", p);
// }, 100);

// 例子2：第一个promise:存放两个，决定第二个promise的执行。依次内推
// const p = new MyPromise((res, rej) => {
//   res("res");
// })
//   .then(
//     () => {
//       console.log("A1");
//     },
//     () => {
//       console.log("A2");
//     }
//   )
//   .then(
//     () => {
//       console.log("B1");
//     },
//     () => {
//       console.log("B2");
//     }
//   );
// setTimeout(() => {
//   console.log("p:", p);
// }, 100);
