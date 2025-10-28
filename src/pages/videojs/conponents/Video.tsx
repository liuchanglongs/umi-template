/**
 * @Author: 刘昌隆
 * @Date: 2024/5/15
 */
import React, { useEffect } from 'react';
// 记得引用css文件！
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import style from './index.less';
import Player from 'video.js/dist/types/player';
type PropsType = {
  height?: number;
  width?: number;
  // 地址
  src?: string | undefined;
  // 播放前图片
  poster?: string | undefined;
  // 事件调用函数
  onReady?: (player: Player) => any;
};

export const VideoJS = (props: PropsType) => {
  // video标签的引用Hook
  const videoRef = React.useRef(null);
  // 播放器实例的引用Hook
  const playerRef = React.useRef<any>(null);
  const { height, width, src, poster, onReady } = props;

  useEffect(() => {
    // 确保video.js的播放器实例player仅被初始化一次，否则会报错
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      if (!videoElement) {
        return;
      }
      playerRef.current = videojs(
        videoElement,
        {
          // https://gitcode.gitcode.host/docs-cn/video.js-docs-cn/docs/guides/react.html
          // 自动播放：为true时，加载完毕自动播放 : fale true any
          autoplay: true,
          // 播放器子控件是否显示：为true时显示暂停、播放速率等按钮
          controls: true,
          // 响应性：为true时，播放视频进度条会自动移动
          // responsive: true,
          // 流式布局：为true时尽可能大得填满父标签的剩余空间
          // fluid: true,
          // height: 500,
          // width: 1200,
          // 视频封面图地址
          // poster: './img.png',
          // 视频源
          playbackRates: [0.5, 1, 1.5, 2],
          // sources: [
          //   {
          //     // 视频文件的路径，可以是一个前端相对路径、后台视频文件URL、直播源等
          //     src: './xiaomi.mp4',
          //     // 视频源类型
          //     type: 'video/mp4',
          //   },
          // ],
          preload: 'auto',
          // 设置语言
          language: 'zh-CN',
          // muted: false, // 是否静音
          controlBar: {
            //播放暂停按钮
            playToggle: true,
            //当前播放时间
            currentTimeDisplay: true,
            //点播流时，播放进度条，seek控制
            progressControl: true,
            //总时间
            durationDisplay: true,
            // 设置声音条竖着
            volumePanel: { inline: false },
            skipButtons: {
              forward: 5,
              backward: 5,
            },
            //全屏控制
            fullscreenToggle: true,
          },
        },
        () => {
          videojs.log('播放器准备就绪！');
          onReady && onReady(playerRef.current);
        }
      );
      // 当props发生变化时，可以对已经存在的player实例作一些操作，如：
    } else {
      // const player = playerRef.current;
      // player.autoplay(options.autoplay);
      // player.src(options.sources);
    }
  }, [videoRef]);

  // 控件被unmount卸载的时候，记得要对player实例执行反初始化dispose
  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player className={style.myVideo}>
      <video
        ref={videoRef}
        className="video-js  vjs-big-play-centered vjs-default-skin"
        poster={poster}
        height={height}
        width={width}
        src={src}
      />
    </div>
  );
};

export default VideoJS;
