import { useAppDispatch, useAppSelector } from "@/reactRedux/hooks";
import {
  decrement,
  increment,
} from "@/reactRedux/reducers/counter/counterSlice";
import React from "react";

const TestReduxCross = () => {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div>
      <h1>测试react-redux是否能够跨标签通信</h1>
      <button
        aria-label="Increment value"
        onClick={() => dispatch(increment())}
      >
        Increment
      </button>
      <h2>{count}</h2>
      <button
        aria-label="Decrement value"
        onClick={() => dispatch(decrement())}
      >
        Decrement
      </button>
    </div>
  );
};

export default TestReduxCross;
