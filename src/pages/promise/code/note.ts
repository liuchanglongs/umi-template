// 实现一个promise：指实现A+规范（then函数）
// 写其它函数catch、finally：直接Promise.prototype.catch = function （只要没叫实现promise，就直接在promise中改造）
// finally: 当Promise状态发生变化时，无论怎么变化都会执行,finally里面的函数都会执行.状态于值就是上一层的。自己的回调函数抛出错误，那么就是输出rejected与错误的值

// 静态方法：
// 面试问实现reject（只要没叫实现promise，就直接在promise中改造）面试题注意
// Promise.reject = function (reason) {
//   return;
// };

/**
 * 让下面的函数一次执行，最后返回一个数组. 模拟async await
 *  1. 需要一个生成器函数，控制运行createGeneratorFunction
 *  2. run 函数：返回一个promise，里面递归执行生成器
 *    next()的返回值l来判断
 * */

const run = (generatorFn) => {
  return new Promise((resolve, reject) => {
    const iterator = generatorFn();
    const deep = (arg, next = "next") => {
      try {
        const iteratorData = iterator[next](arg);
        const { done, value } = iteratorData;
        if (!done) {
          value.then(
            (res) => {
              deep(res);
            },
            (err) => {
              deep(err, "throw");
            }
          );
        } else {
          resolve(value);
        }
      } catch (error) {
        reject(error);
      }
    };
    deep();
  });
};

const createGeneratorFunction = (arryPromise) => {
  const results = [];
  return function* () {
    try {
      for (const fn of arryPromise) {
        const result = yield fn();
        results.push(result);
      }
      return results;
    } catch (error) {
      console.log(error);

      return error;
    }
  };
};

// 模拟第一个异步操作的函数，返回一个 Promise
function fetchData1() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("这是异步获取的数据 1");
    }, 1000);
  });
}

// 模拟第二个异步操作的函数，返回一个 Promise
function fetchData2() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("这是异步获取的数据 2");
    }, 1500);
  });
}

run(createGeneratorFunction([fetchData1, fetchData2])).then((res) => {
  console.log(res);
});

function asyncFunction(generatorFunction: Function): Function {
  return function (this: any, ...args: any[]): Promise<any> {
    const generator = generatorFunction.apply(this, args);

    return new Promise((resolve, reject) => {
      function step(key: "next" | "throw", arg?: any): void {
        let result;
        try {
          result = generator[key](arg);
        } catch (error) {
          return reject(error);
        }

        const { value, done } = result;

        if (done) {
          return resolve(value);
        }

        Promise.resolve(value).then(
          (val) => step("next", val),
          (err) => step("throw", err)
        );
      }

      step("next");
    });
  };
}

const runGenerator = (generator: Generator) => {
  return new Promise((resolve, reject) => {
    function handle(result: IteratorResult<any>) {
      if (result.done) {
        return resolve(result.value);
      }

      Promise.resolve(result.value).then(
        (value) => handle(generator.next(value)),
        (error) => handle(generator.throw(error))
      );
    }

    try {
      handle(generator.next());
    } catch (error) {
      reject(error);
    }
  });
};

// 定义异步操作
function delay(ms: number, value: any): Promise<any> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// 使用模拟的async/await
const asyncExample = asyncFunction(function* () {
  try {
    console.log("开始执行");

    // yield模拟await
    const result1 = yield delay(1000, "第一步完成");
    console.log(result1);

    const result2 = yield delay(500, "第二步完成");
    console.log(result2);

    return "全部完成";
  } catch (error) {
    console.log("捕获到错误:", error);
  }
});

// 执行
asyncExample().then((finalResult) => {
  console.log("最终结果:", finalResult);
});

    