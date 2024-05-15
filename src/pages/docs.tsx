/**
 * @Author: 刘昌隆
 * @Date: 2024/5/15
 */

import React from 'react';

import VideoJS from '../conponents/Video';
const DocsPage = () => {
  const playerRef = React.useRef(null);
  // https://gitcode.gitcode.host/docs-cn/video.js-docs-cn/docs/guides/react.html
  const videoJsOptions = {
    // 自动播放：为true时，加载完毕自动播放 : fale true any
    autoplay: true,
    // 播放器子控件是否显示：为true时显示暂停、播放速率等按钮
    controls: true,
    // 响应性：为true时，播放视频进度条会自动移动
    responsive: true,
    // 流式布局：为true时尽可能大得填满父标签的剩余空间
    fluid: true,
    // 视频源
    sources: [
      {
        // 视频文件的路径，可以是一个前端相对路径、后台视频文件URL、直播源等
        src: './xiaomi.mp4',
        // 视频源类型
        type: 'video/mp4',
        poster: false,
      },
    ],
    poster: 'xxx', // 视频封面图地址
    preload: 'auto',
    language: 'zh-CN', // 设置语言
    muted: false, // 是否静音
    inactivityTimeout: false,
    controlBar: {
      skipButtons: {
        forward: 5,
      },
      // 设置控制条组件
      //  设置控制条里面组件的相关属性及显示与否
      // currentTimeDisplay: true,
      // timeDivider: true,
      // durationDisplay: true,
      // remainingTimeDisplay: false,
      // playbackRateMenuButton: true,
      // volumePanel: {
      //   inline: false,
      // },
      /* 使用children的形式可以控制每一个控件的位置，以及显示与否 */
      children: [
        { name: 'playToggle' }, // 播放按钮
        { name: 'currentTimeDisplay' }, // 当前已播放时间
        { name: 'progressControl' }, // 播放进度条
        { name: 'durationDisplay' }, // 总时间
        {
          // 倍数播放
          name: 'playbackRateMenuButton',
          playbackRates: [0.5, 1, 1.5, 2, 2.5],
        },
        {
          name: 'volumePanel', // 音量控制
          inline: false, // 不使用水平方式
        },
        { name: 'FullscreenToggle' }, // 全屏
      ],
    },
  };

  // 播放器实例化完成后的事件动作，注意！不是视频加载成功
  const handlePlayerReady = (player: any) => {
    playerRef.current = player;
    // 播放器的子事件在这里定义

    player.on('canplaythrough', () => {
      console.log('视频加载完成！');
    });

    player.on('error', () => {
      console.log(`视频文件加载失败，请稍后重试！`);
    });

    player.on('stalled', () => {
      console.log(`网络异常，请稍后重试！`);
    });
  };
  return (
    <div>
      <VideoJS options={videoJsOptions} onReady={handlePlayerReady}></VideoJS>
    </div>
  );
};

export default DocsPage;
