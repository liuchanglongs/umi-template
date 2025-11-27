// 实现一个promise：指实现A+规范（then函数）
// 写其它函数catch、finally：直接Promise.prototype.catch = function （只要没叫实现promise，就直接在promise中改造）
// finally: 当Promise状态发生变化时，无论怎么变化都会执行,finally里面的函数都会执行.状态于值就是上一层的。自己的回调函数抛出错误，那么就是输出rejected与错误的值

// 静态方法：
// 面试问实现reject（只要没叫实现promise，就直接在promise中改造）面试题注意
Promise.reject = function (reason) {
  return;
};

class A {
  fn() {}
  static fn1() {}
}

A.fn1(); // 为啥？搞明白static public private

//
/**
 * Promise.resolve():
 * 1. 传递的data为ES6的promise 对象，直接返回
 * 2. 传递的data使PromiseLike（Promise A+： thenAble）,返回新的Promise，状态保对其一致
 * 3. 其它情况：返回一个已经完成的新的Promise
 * */

/**
 * Promise.reject():得到一个被拒绝(rejected状态)的Promise
 * 1. 传递的data为ES6的promise 对象，直接返回
 * 2. 传递的data使PromiseLike（Promise A+： thenAble）,返回新的Promise，状态保对其一致
 * 3. 其它情况：返回一个已经完成的新的Promise
 * */

/**
 * Promise.all: 传一个迭代器（例如数组），可以被for of遍历，不能被for遍历，不一定有下标（索引）
 * 1. 迭代器中：传promise，全部成功才返回。（传普通值直接Promise.resolve()转换，变成一个promise对象）
 * 2. 成功输出：按照传入的顺序输出：注意理解这个
 * 3. 失败输出：输出失败的那个promise
 * 4. 注意空数组： 返回一个值为空数组的Promise
 * 5. 不传迭代对象：返回一个值为这个错误的Promise
 * */
