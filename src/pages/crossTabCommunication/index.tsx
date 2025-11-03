import React from "react";
import TestReduxCross from "./TestReduxCross.tsx";
import BroadcastChannelCross from "./broadcastChannelCross";
import LocalStorageCross from "./localStorageCross";

const Index = () => {
  return (
    <div>
      <TestReduxCross></TestReduxCross>
      <BroadcastChannelCross></BroadcastChannelCross>
      <LocalStorageCross></LocalStorageCross>
    </div>
  );
};

export default Index;
