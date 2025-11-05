import { Button } from "antd";
import React from "react";

const Index = () => {
  function closeCurrentWindow() {
    try {
      // 设置opener为null，断开与父窗口的关联
      window.opener = null;

      // 创建一个新的窗口引用，让浏览器认为当前页面是由脚本打开的
      const newWindow: any = window.open("", "_self");

      // 关闭当前窗口
      newWindow.close();

      // 如果上述方法失败，提供降级方案
      if (!newWindow.closed) {
        // 对于某些浏览器，重定向到about:blank
        window.location.href = "about:blank";
      }
    } catch (error) {
      console.warn("无法关闭窗口:", error);

      // 最终降级方案：显示用户友好的提示
      if (confirm("请手动关闭此标签页")) {
        window.location.href = "about:blank";
      }
    }
  }
  return (
    <div>
      <Button
        onClick={() => {
          window.open("http://localhost:8000/close-tab");
        }}
      >
        打开标签
      </Button>
      <Button
        onClick={() => {
          window.close();
        }}
      >
        关闭标签
      </Button>
      <Button onClick={closeCurrentWindow}>closeCurrentWindow</Button>
    </div>
  );
};

export default Index;
