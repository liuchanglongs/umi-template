import React, { useEffect, useRef, useState } from "react";

const LocalStorageCross = () => {
  const [msg, setMsg] = useState<any>({});
  useEffect(() => {
    // 接收消息的标签页
    const updateData = (event: any) => {
      // 只处理我们的消息
      if (event.key === "cross-tab-message" && event.newValue) {
        try {
          const { data } = JSON.parse(event.newValue);
          setMsg(data);
        } catch (error) {
          console.error("解析消息失败:", error);
        }
      }
    };
    window.addEventListener("storage", updateData);
    return () => {
      window.removeEventListener("resize", updateData);
    };
  }, []);

  // 发送消息的标签页
  function sendMessage(type: string, data: any) {
    const message = {
      type: type,
      data: data,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9),
    };
    // 写入 localStorage 触发 storage 事件
    localStorage.setItem("cross-tab-message", JSON.stringify(message));

    // 立即删除，避免存储污染
    localStorage.removeItem("cross-tab-message");
  }

  return (
    <div>
      <h1>localStorage 通信</h1>
      <input
        type="text"
        value={msg?.data || ""}
        onChange={(e) => setMsg({ data: e.target.value })}
      />
      <button
        onClick={() => {
          sendMessage("msg", msg);
        }}
      >
        发送消息
      </button>
    </div>
  );
};

export default LocalStorageCross;
