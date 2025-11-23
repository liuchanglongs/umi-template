const p = new Promise((resolve, reject) => {
  // 情况一：返回一个普通的值；
  resolve("1111");
});

p.then((res) => {
  console.log("第一次：", res); // 第一次:111

  // 默认相当于 new Promise(resolve=>{resolve('222')})
  new Promise((resolve) => {
    console.log("---");
    resolve("222");
  });
  // return "222333";
})
  .then((res) => {
    console.log("第2次：", res); // 第一次:222

    // 情况二：返回一个Promise；
    return new Promise((resolve) => {
      resolve(333);
    });
  })
  .then((res) => {
    console.log("第3次：", res); // 第一次:333

    // 情况三：返回一个then able值；
    return {
      then: (resolve: any) => {
        resolve(444);
      },
    };
  })
  .then((res) => {
    console.log("第4次：", res); // 第一次:444
  });

p.then((res) => {
  console.log("在一次：", res); // 第一次:111
});

// const promises = [
//   Promise.resolve(1),
//   Promise.reject(new Error("failed")),
//   new Promise((resolve) => setTimeout(() => resolve(3), 5000)),
// ];

// 等待所有完成，并且返回各自的状态
// Promise.allSettled(promises).then((results) => {
//   // results:
//   // [
//   //   { status: 'fulfilled', value: 1 },
//   //   { status: 'rejected', reason: Error('failed') },
//   //   { status: 'fulfilled', value: 3 }
//   // ]
//   console.log(results);
// });

const p1 = Promise.reject(new Error("a"));
const p2 = new Promise((resolve) => setTimeout(() => resolve("b"), 100));
const p3 = Promise.reject(new Error("c"));
Promise.any([p1, p2, p3])
  .then((value) => {
    // 输出 'b' —— 第一个 fulfilled 的 Promise 的值
    console.log("fulfilled with", value);
  })
  .catch((err) => {
    // 如果所有都 reject，这里会得到一个 AggregateError
    console.error(err instanceof AggregateError); // true
    console.error(err.errors); // 包含每个输入 Promise 的拒绝原因
  });

// 下面代码的输出结果是什么

// const pc = new Promise((resolve, reject) => {
//   throw new Error(1);
//   // resolve();
// })
//   .then((res) => {
//     console.log(res);
//     return new Error("2");
//   })
//   .catch((err) => {
//     console.log("err", err);
//     throw err;
//     return 3;
//   })
//   .then((res) => {
//     console.log(res);
//   });

// setTimeout(() => {
//   console.log(pc);
// }, 50);
