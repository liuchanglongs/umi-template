// 实现一个promise：指实现A+规范（then函数）
// 写其它函数：直接Promise。prototype.catch = function
// finally: 当Promise状态发生变化时，无论怎么变化都会执行,finally里面的函数都会执行.状态于值就是上一层的。自己的回调函数抛出错误，那么就是输出rejected与错误的值
