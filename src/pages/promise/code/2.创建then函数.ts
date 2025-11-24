/**
 * 思考实现任何一个函数：
 * - 参数咋传递：两个参数 onreslve, onreject
 * - 返回值是啥:新的promise
 * - 这个函数做啥:
 *     - 回调函数不会马上执行，会在微队列中执行咋注册函数？
 *     - 怎么注册这两个回调函数？
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
    console.log("node环境:queueMicrotaskprocess");
    return;
  } else if (typeof queueMicrotask === "function") {
    // node 浏览器
    queueMicrotask(callback);
    console.log("node 浏览器环境:queueMicrotask");
    return;
  } else if (MutationObserver) {
    const p = document.createElement("p");
    const observe = new MutationObserver(callback);
    observe.observe(p, { childList: true });
    p.innerHTML = "1";
    console.log("浏览器环境:queueMicrotask");
    return;
  } else {
    console.log("setTimeout 兜底");
    setTimeout(callback, 0);
  }
}

enum StateEnum {
  pending = "pending",
  fulfilled = "fulfilled",
  rejected = "rejected",
}
export class MyPromise {
  private state: StateEnum = StateEnum.pending;
  private data: any;
  constructor(
    executor: (
      resolve: (value?: any) => void,
      reject: (msg?: any) => void
    ) => void
  ) {
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
    console.log(this.state, this.data);
  }

  /**
   *
   * */
  then(onReslve?: (data?: any) => any, onReject?: (data?: any) => any) {
    return new MyPromise(() => {});
  }
}

new MyPromise((res, rej) => {
  // res("res");
  // res("res");
  // res("res");
  // rej("rej");
}).then(
  () => {},
  () => {}
);

console.log(1);
setTimeout(() => {
  console.log(2);
}, 200);
MmMicroTask(() => {
  console.log(3);
});
