import React, { useEffect, useRef, useState } from "react";

const BroadcastChannelCross = () => {
  const channel = useRef<BroadcastChannel>();
  const [msg, setMsg] = useState<any>({});
  useEffect(() => {
    // 创建频道
    channel.current = new BroadcastChannel("my-channel");
    // 接收消息
    channel.current.addEventListener("message", (event) => {
      setMsg(JSON.parse(event.data));
    });
    return () => {
      // // 关闭通道（自动清除所有监听，释放资源）
      channel.current && channel.current.close();
    };
  }, []);

  return (
    <div>
      <h1>BroadcastChannel 通信</h1>
      <input
        type="text"
        value={msg?.data || ""}
        onChange={(e) => setMsg({ data: e.target.value })}
      />
      <button
        onClick={() => {
          if (channel.current) {
            channel.current.postMessage(JSON.stringify(msg));
          }
        }}
      >
        发送消息
      </button>
    </div>
  );
};

export default BroadcastChannelCross;
