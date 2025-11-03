import { Input } from "antd";
import React, { useEffect, useRef } from "react";

const Index = () => {
  const imgsRef = useRef<HTMLDivElement>(null);
  // useEffect(() => {

  //   // // 创建文件输入元素
  //   // const inp = document.createElement("input");
  //   // inp.type = "file";
  //   // inp.accept = "video/*"; // 只接受视频文件
  //   // document.body.appendChild(inp);

  //   // 存储生成的图片URL用于清理
  //   const generatedUrls: string[] = [];

  //   // inp.addEventListener("change", handleFileChange);

  //   // 清理函数 - 组件卸载时执行
  //   return () => {
  //     inp.removeEventListener("change", handleFileChange);
  //     inp.remove();
  //     // 清理所有生成的URL和预览图
  //     generatedUrls.forEach((url) => {
  //       URL.revokeObjectURL(url);
  //     });
  //     document.querySelectorAll(".frame-preview").forEach((el) => el.remove());
  //   };
  // }, []);

  // 预览图片函数 - 添加类型定义和样式
  function previewImage(url: string) {
    const img = document.createElement("img");
    img.src = url;
    img.className = "frame-preview";
    img.style.maxWidth = "200px";
    img.style.margin = "10px";
    img.style.border = "1px solid #ccc";
    imgsRef.current && imgsRef.current.appendChild(img);
  }

  // 捕获视频帧函数 - 完善错误处理和加载逻辑
  function captureFrame(vdoFile: File, time = 0) {
    return new Promise<{ blob: Blob; url: string }>((resolve, reject) => {
      const vdo = document.createElement("video");
      // 视频属性配置
      vdo.muted = true;
      vdo.autoplay = true;
      vdo.playsInline = true; // 解决移动端自动播放限制
      vdo.src = URL.createObjectURL(vdoFile);

      // 错误处理
      vdo.onerror = () => {
        reject(new Error("视频加载失败"));
        URL.revokeObjectURL(vdo.src); // 清理资源
      };

      // 视频元数据加载完成后再设置时间点
      vdo.onloadedmetadata = () => {
        // 确保时间点在有效范围内
        const validTime = Math.min(Math.max(time, 0), vdo.duration);
        vdo.currentTime = validTime;
      };

      // 当视频可以在当前时间点播放时捕获帧
      vdo.onseeked = () => {
        try {
          const cvs = document.createElement("canvas");
          cvs.width = vdo.videoWidth;
          cvs.height = vdo.videoHeight;
          const ctx = cvs.getContext("2d");

          if (!ctx) {
            throw new Error("无法获取Canvas上下文");
          }
          // The CanvasRenderingContext2D.drawImage() method of the Canvas 2D API provides different ways to draw an image onto the canvas.
          ctx.drawImage(vdo, 0, 0, cvs.width, cvs.height);

          cvs.toBlob(
            (blob) => {
              if (!blob) {
                throw new Error("Canvas转Blob失败");
              }
              const url = URL.createObjectURL(blob);
              resolve({ blob, url });
              URL.revokeObjectURL(vdo.src); // 清理视频资源
            },
            "image/jpeg",
            0.9
          ); // 指定格式和质量
        } catch (error) {
          reject(error);
          URL.revokeObjectURL(vdo.src);
        }
      };
    });
  }

  // 文件选择变化处理
  const handleFileChange = async (e: any) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    // 清理之前的预览图
    // generatedUrls.forEach((url) => {
    //   URL.revokeObjectURL(url);
    // });
    document.querySelectorAll(".frame-preview").forEach((el) => el.remove());

    try {
      // 捕获多个时间点的帧（0s, 5s, 10s, 15s）
      for (let i = 0; i < 20; i += 5) {
        const result = await captureFrame(file, i);
        // generatedUrls.push(result.url);
        previewImage(result.url);
      }
    } catch (error) {
      console.error("捕获视频帧失败:", error);
    }
  };

  return (
    <div>
      <h3>视频播放器</h3>
      <video
        poster={"./img.png"}
        height={500}
        width={500}
        src="./xiaomi.mp4"
        controls
        playsInline
      ></video>
      <input type="file" accept="video/*" onChange={handleFileChange}></input>
      <div ref={imgsRef}></div>
    </div>
  );
};

export default Index;
