import React, { useEffect, useRef, useState } from "react";
import TestReduxCross from "./TestReduxCross";
import BroadcastChannelCross from "./broadcastChannelCross";
import LocalStorageCross from "./localStorageCross";
import { CurrentChannelType, MyChannelCrossTabMessage } from "./FormStorage";

interface MsgType {
  data: any;
}
const Index = () => {
  const channel = useRef<CurrentChannelType | null>(null);
  const myCrossRef = useRef<MyChannelCrossTabMessage | null>(null);
  const [msg, setMsg] = useState<MsgType>({ data: null });
  useEffect(() => {
    // 创建频道
    const myCross = new MyChannelCrossTabMessage(
      "MyChannelCrossTabMessage",
      "localStorage"
    );
    myCrossRef.current = myCross;
    myCross.init().then(() => {
      channel.current = myCross.currentChannel;
      myCross.currentChannel?.onMessage((data: any) => {
        if (data) {
          setMsg(data);
        } else {
          setMsg({ data: null });
        }
      });
    });
  }, []);
  return (
    <div>
      <TestReduxCross></TestReduxCross>
      <BroadcastChannelCross></BroadcastChannelCross>
      <LocalStorageCross></LocalStorageCross>
      <div>
        <h1>使用 MyChannelCrossTabMessage 通信</h1>
        <input
          type="text"
          value={msg?.data || ""}
          onChange={(e) => setMsg({ data: e.target.value })}
        />
        <button
          onClick={() => {
            if (channel.current) {
              channel.current.sendMessage<MsgType>(msg);
            }
          }}
        >
          发送消息
        </button>
        <button
          onClick={() => {
            if (myCrossRef.current) {
              myCrossRef.current.storage?.clearall();
            }
          }}
        >
          删除当前表单数据
        </button>
        <button
          onClick={() => {
            if (myCrossRef.current) {
              myCrossRef.current.storage?.clearData("MyChannelCrossTabMessage");
            }
          }}
        >
          删除当前存储数据
        </button>
      </div>
    </div>
  );
};

export default Index;
