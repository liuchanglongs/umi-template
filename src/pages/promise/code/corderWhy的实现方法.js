/**
 * 看袁老师的，写的有点乱
 *
 * MyPromise初始化实例的时候传入普通函数会怎么样: 箭头函数指向上层作用域window，普通函数
 * 独立函数调用指向window
 *
 * 1.new MyPromise(fn)传入一个函数并执行。函数有2个参数：resolve与reject函数
 * 2.声明两个变量存储resolve与reject函数 传入的值： value = undefined;reason = undefined;
 * 4.声明三个状态变量 pending fulfilled rejected：初始实例化为pending，  status = pending
 *    queueMicrotask：在pending状态使用queueMicrotask
 *    MyPromise中： 利用状态管理防止同时调用 resolve("resolve")/reject("reject");，只执行最先的
 *    then：后续then(resolveFn,rejectFn)中的函数执行取决于上一个状态：为fulfilled执行resolveFn，为rejected执行rejectFn
 * 5.then 方法，加入微任务中执行，
 *    思考：在哪里加？
 *    then方法里：不合适，毕竟 then链式调用，每调用一个就加入一个微任务，保证不了顺序
 *    resolve/reject里面：多个实例调用then,保证then的执行顺序； resolve/reject没有调用的时候保证then方法不会被调用
 * 6.处理多个实例调用then
 *     onResolve、onReject声明为 [](私有变量)，防止then方法被覆盖
 *     then方法中为pending状态，返回结果后为 fulfilled/rejected
 *     宏任务中的promise：此时的then方法中为fulfilled/rejected状态. 例如settimeout 里面
 * 7.处理then的链式调用
 *     then 方法返回新的MyPromise实例。在新的MyPromise实例中处理nResolve/onReject，
 *     并返回前一个then中onResolve, onReject函数返回的值。调用resolve, reject
 *     坑：
 *      1. return 传入的函数是箭头函数还是一般函数？
 *         答案：箭头函数，一般函数拿不到value/reason的值，this为window。
 *      2. onReject：为啥默认会给异常处理函数，因为需要 reject(data)函数调用往后层，传入抛出的异常值。
 * 8.catch方法的实现
 *     利用try catch 捕获错误；throw抛出错误；
 *     捕获错误的点：MyPromise传入的函数，this.then中
 *     每个catch都返回一个promise，类似then，可以连续调用，所以直接调用this.then，状态为rejected
 * 9. 实现finally方法
 * 10. 实现类方法 resolve()、reject(): 接受一个数据，返回一个MyPromise
 * 11. 实现类方法
 *  all()：接受一个MYpromise的数组，最后同时返回，一个失败就结束运行。
 *  allsettled(): 接受一个MYpromise的数组，最后同时返回，所有的都有状态
 */

const pending = "pending";
const fulfilled = "fulfilled";
const rejected = "rejected";

class MyPromise {
  //
  #value = undefined;
  #reason = undefined;
  #onResolve = [];
  #onReject = [];
  #status = pending;
  constructor(fn) {
    const resolve = (...arg) => {
      if (this.#status === pending) {
        this.#value = arg;
        // pending状态：this?.onResolve函数加入微任务
        queueMicrotask(() => {
          // console.log('this.#onResolve.length ', this);
          /**
           * 利用状态管理防止同时调用 resolve("resolve")/reject("reject");，只执行最先的
           * */
          if (this.#status != pending) return;
          this.#status = fulfilled;
          this.#onResolve.length &&
            this.#onResolve.forEach((fn) => {
              fn(...arg);
            });
        });
      }
    };
    const reject = (...arg) => {
      if (this.#status === pending) {
        this.#reason = arg;
        queueMicrotask(() => {
          if (this.#status != pending) return;
          this.#status = rejected;
          this.#onReject.length &&
            this.#onReject.forEach((fn) => {
              fn(...arg);
            });
        });
      }
    };

    try {
      fn && fn(resolve, reject);
    } catch (error) {
      reject(error);
    }

    this.then = (onResolve, onReject) => {
      // 实现catch 没有传
      const errFn = (err) => {
        throw err;
      };
      onReject = onReject || errFn;
      return new MyPromise((resolve, reject) => {
        // 微任务
        if (this.#status === pending) {
          onResolve &&
            this.#onResolve.push((...value) => {
              try {
                const data = onResolve(...value);
                resolve(data);
              } catch (error) {
                reject(error);
              }
            });
          onReject &&
            this.#onReject.push((...value) => {
              try {
                const data = onReject(...value);
                reject(data);
              } catch (error) {
                reject(error);
              }
            });
        }
        // 宏任务中的promise：此时的then方法中为fulfilled/rejected状态
        if (this.#status === fulfilled && onResolve) {
          queueMicrotask(() => {
            try {
              const data = onResolve(this.#value);
              resolve(data);
            } catch (error) {
              reject(error);
            }
          });
        } else if (this.#status === rejected && onReject) {
          queueMicrotask(() => {
            try {
              const data = onReject(this.#reason);
              reject(data);
            } catch (error) {
              reject(error);
            }
          });
        }
      });
    };
    this.catch = (onCatch) => {
      this.then(null, onCatch);
    };
    this.finally = (onfinally) => {
      this.then(onfinally, onfinally);
    };
  }
  static reject(rejectData) {
    return new MyPromise((resolve, reject) => {
      reject(rejectData);
    });
  }
  static resolve(resolveData) {
    return new MyPromise((resolve, reject) => {
      resolve(resolveData);
    });
  }
  static all(arry) {
    const result = [];
    return new MyPromise((resolve, reject) => {
      // 判断为空
      if (!arry.length) {
        reject("空数组");
      }
      arry.forEach((fn) => {
        // 先转成promise
        MyPromise.resolve(fn)
          .then((value) => {
            value.then((value) => {
              result.push(value);
              if (result.length == arry.length) {
                resolve(result);
              }
            });
          })
          .catch((err) => reject(err));
      });
    });
  }
  static allsettled(arry) {
    const result = [];
    return new MyPromise((resolve, reject) => {
      // 判断为空
      if (!arry.length) {
        reject("空数组");
      }
      arry.forEach((fn) => {
        // 先转成promise
        MyPromise.resolve(fn).then((value) => {
          value.then(
            (value) => {
              console.log("value", value);
              result.push({ value, statu: fulfilled });
              if (result.length == arry.length) {
                resolve(result);
              }
            },
            (err) => {
              console.log("err", err);
              result.push({ value: err, statu: rejected });
              if (result.length == arry.length) {
                resolve(result);
              }
            }
          );
        });
      });
    });
  }
  static race(promises) {
    return new MyPromise((reslove, reject) => {
      //  reslove：第一个执行有结果就执行,第一个reslove/reject后改变了状态后面就不执行了
      // reject：第一个执行有结果就执行
      promises.forEach((fn) => {
        fn.then(
          (res) => {
            reslove(res);
          },
          (err) => {
            reject(err);
          }
        );
      });
    });
  }

  static any(promises) {
    const arry = [];
    return new MyPromise((reslove, reject) => {
      // reslove:只有一个就执行
      // reject：全错才执行
      promises.forEach((fn) => {
        fn.then(
          (res) => {
            reslove(res);
          },
          (err) => {
            arry.push(err);
            if (arry.length === promises.length) {
              reject(arry);
            }
          }
        );
      });
    });
  }
}
// ---------------------------------

// MyPromise.reject('reject').then(res=>{
//   console.log(res);
// },err=>{
//   console.log(err);
// })
// MyPromise.resolve('resolve').then(res=>{
//   console.log(res);
// })
// ---------------------------------

// const p1 = new MyPromise((resolve, reject) => {
//   // resolve("resolve");
//   reject("初始化");
// })
// console.log('start');
// p1.then(
//   (res) => {
//     console.log('res', res);
//     return 'p1'
//   },
// ).then(
//   (res) => {
//     console.log('res2', res);
//     return 'p2'
//   },
// ).then(
//   (res) => {
//     console.log('res2', res);
//     return 'p2'
//   },
// ).then(
//   (res) => {
//     console.log('res2', res);
//     return 'p2'
//   },
// ).then(
//   (res) => {
//     console.log('res2', res);
//     return 'p2'
//   },
//   (err) => {
//     console.log('err', err);
//     return 'p2'
//   },
// ).finally((value)=>{
//   console.log('finally', value);
// });
// .catch(err => {
//   console.log('catch', err)
// })

// p1.then(
//   (res1) => {
//     console.log('res1', res1);
//   },
//   (err1) => {
//     console.log('err1', err1);
//   }
// )
// setTimeout(() => {
//   console.log('setTimeout2')
//   p1.then(
//     (res2) => {
//       console.log('res2', res2);
//     },
//     (res2) => {
//       console.log('res2', res2);
//     }
//   );
// }, 0);
// setTimeout(() => {
//   console.log('setTimeout3')
//   p1.then(
//     (res2) => {
//       console.log('res3', res2);
//     },
//     (res2) => {
//       console.log('res3', res2);
//     }
//   );
// }, 0);
// setTimeout(() => {
//   console.log('setTimeout4')
//   p1.then(
//     (res2) => {
//       console.log('res4', res2);
//     },
//     (res2) => {
//       console.log('res4', res2);
//     }
//   );
// }, 0);
// console.log('end');
// ---------------------------------
// const delay = ms => {
//   return new MyPromise(reslove => {
//     setTimeout(reslove, ms)
//   })
// }
// let p1 = delay(1000).then(() => {
//   console.log("p1完成");
//   return 'p1'
//   // return Promise.reject('p1')  //p2没返回
// })
// let p2 = delay(2000).then(() => {
//   console.log("p2完成");
//   // return 'p2'
//   return 'p2'  //p1没返回
// }, err=>{
//   return 'p2'  //p1没返回
// })
// let p3 = MyPromise.allsettled([p1, p2, new MyPromise((res,rej)=>{
//   rej(11)
// })])
// p3.then(data => {
//   console.log('p3 data', data);
// }, err => {
//   console.log(err);
// })
// let p4 = Promise.allSettled([p1, p2, new MyPromise((res,rej)=>{
//   rej(11)
// })])
// p4.then(data => {
//   console.log('p4 data', data);
// }, err => {
//   console.log(err);
// })
// ---------------------------------

const p1 = new MyPromise((reslove, resject) => {
  setTimeout(() => {
    // reslove('aaa');
    reslove("aaa");
  }, 1000);
});

const p2 = new MyPromise((reslove, resject) => {
  setTimeout(() => {
    // resject('bbb');
    reslove("bbb");
  }, 2000);
});

const p3 = new MyPromise((reslove, resject) => {
  setTimeout(() => {
    reslove("ccc");
  }, 3000);
});

// MyPromise.race([p1, p2, p3])
//   .then(
//     (res) => {
//       console.log('race:', res);
//     }
//     // (err) => {
//     //   console.log('err:', err);
//     // }
//   )
//   .catch((err) => {
//     console.log('err', err);
//   });

MyPromise.any([p1, p2, p3])
  .then(
    (res) => {
      console.log("res:", res);
    },
    (err) => {
      console.log("err:", err);
    }
  )
  .catch((err) => {
    console.log("err", err);
  });

// const promise = new Promise((resolve, reject) => {
//   console.log('promise', this);
//   resolve("resolve");
//   // reject("reject");
// })
// promise.then((res) => {
//   console.log(res);
// },
//   (err) => {
//     console.log(err);
//   }).catch((err) => {
//     console.log('err', err);
//   }).then(res=>{
//   console.log(res);
//   })
