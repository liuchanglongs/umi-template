import React from "react";
import OptimizedLongList from "./optimizedLongList";
import LongList from "./longList";

const Index = () => {
  return (
    <div>
      <h1>requestAnimationFrame 优化长列表</h1>
      <OptimizedLongList totalItems={10000} />
      {/* <LongList></LongList> */}
    </div>
  );
};

export default Index;
