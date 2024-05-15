/**
 * @Author: 刘昌隆
 * @Date: 2024/5/15
 */
import React from 'react';
import videojs from 'video.js';
// 记得引用css文件！
import 'video.js/dist/video-js.css';
import './index.less';
type PropsType = {
  options: any;
  onReady: any;
};

export const VideoJS = (props: PropsType) => {
  // video标签的引用Hook
  const videoRef = React.useRef(null);
  // 播放器实例的引用Hook
  const playerRef = React.useRef<any>(null);
  const { options, onReady } = props;

  React.useEffect(() => {
    // 确保video.js的播放器实例player仅被初始化一次，否则会报错
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      if (!videoElement) {
        return;
      }

      const player = (playerRef.current = videojs(
        videoElement,
        {
          // 自动播放：为true时，加载完毕自动播放 : fale true any
          autoplay: true,
          // 播放器子控件是否显示：为true时显示暂停、播放速率等按钮
          controls: true,
          // 响应性：为true时，播放视频进度条会自动移动
          responsive: true,
          // 流式布局：为true时尽可能大得填满父标签的剩余空间
          // fluid: true,
          height: 500,
          width: 500,
          // 视频封面图地址
          poster: './img.png',
          // 视频源
          sources: [
            {
              // 视频文件的路径，可以是一个前端相对路径、后台视频文件URL、直播源等
              src: './xiaomi.mp4',
              // 视频源类型
              type: 'video/mp4',
            },
          ],
          preload: 'auto',
          language: 'zh-CN', // 设置语言
          muted: false, // 是否静音
          inactivityTimeout: false,
          controlBar: {
            //播放暂停按钮
            playToggle: true,
            //当前播放时间
            currentTimeDisplay: true,
            //点播流时，播放进度条，seek控制
            progressControl: true,
            //总时间
            durationDisplay: true,
            //播放速率，当前只有html5模式下才支持设置播放速率
            playbackRateMenuButton: true,
            volumePanel: { inline: false },
            //全屏控制
            fullscreenToggle: true,

            // volumeMenuButton,//音量控制
            // currentTimeDisplay,
            // timeDivider, // '/' 分隔符
            // liveDisplay, //直播流时，显示LIVE
            // remainingTimeDisplay, //当前播放时间
            // 设置控制条组件
            // 设置控制条里面组件的相关属性及显示与否
            // timeDivider: true,
            // remainingTimeDisplay: true,

            // skipButtons: {
            //   forward: 5,
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
              },
              // { name: 'FullscreenToggle' }, // 全屏
            ],
          },
        },
        () => {
          videojs.log('播放器准备就绪！');
          onReady && onReady(player);
        }
      ));
      // 当props发生变化时，可以对已经存在的player实例作一些操作，如：
    } else {
      // const player = playerRef.current;
      // player.autoplay(options.autoplay);
      // player.src(options.sources);
    }
  }, [options, videoRef]);

  // 控件被unmount卸载的时候，记得要对player实例执行反初始化dispose
  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
};

export default VideoJS;
