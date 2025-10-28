/**
 * @Author: 刘昌隆
 * @Date: 2024/5/15
 */

import React from "react";

import VideoJS from "./conponents/Video";
const DocsPage = () => {
  const playerRef = React.useRef(null);

  // 播放器实例化完成后的事件动作，注意！不是视频加载成功
  const handlePlayerReady = (player: any) => {
    playerRef.current = player;
    // 播放器的子事件在这里定义

    player.on("canplaythrough", () => {
      console.log("视频加载完成！");
    });

    player.on("error", () => {
      console.log(`视频文件加载失败，请稍后重试！`);
    });

    player.on("stalled", () => {
      console.log(`网络异常，请稍后重试！`);
    });
  };
  return (
    <div>
      <VideoJS
        onReady={handlePlayerReady}
        width={725}
        height={400}
        src="./xiaomi.mp4"
        poster="./img.png"
      ></VideoJS>
    </div>
  );
};

export default DocsPage;
