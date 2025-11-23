/**
 * 1.状态一旦改变，就不能改变。默认为pending
 * 2. throw err、报错为pending
 * */
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
  changeState(state: StateEnum, data: any) {
    if (this.state != StateEnum.pending) {
      return;
    }
    this.state = state;
    this.data = data;
    console.log(this.state, this.data);
  }
}

new MyPromise((res, rej) => {
  // res("res");
  // res("res");
  // res("res");
  // rej("rej");

  // throw 111;
  throw new Error("111");
});
