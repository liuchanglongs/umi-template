export default {
  routes: [
    {
      path: "/",
      component: "index",
      routes: [
        { path: "/videojs", component: "@/pages/videojs" },
        { path: "/yuying", component: "@/pages/yuying" },
        { path: "/react-ace", component: "@/pages/react-ace" },
        {
          path: "/video-frame-preview",
          component: "@/pages/VideoFramePreview",
        },
        {
          path: "/cross-tab-communication",
          component: "@/pages/crossTabCommunication",
        },
        {
          path: "/requestAnimationFrame",
          component: "@/pages/requestAnimationFrame",
        },
        {
          path: "/close-tab",
          component: "@/pages/closeTab",
        },
        {
          path: "/to-picture",
          component: "@/pages/toPicture",
        },
        {
          path: "/promise",
          component: "@/pages/promise",
        },
      ],
    },
  ],
};
