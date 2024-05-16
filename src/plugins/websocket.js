/*
 * @Description  : websocket连接
 * @Author       : Xiaox
 * @Date         : 2022-10-15 19:17:26
 * @LastEditors  : Xiaox
 * @LastEditTime : 2023-01-06 12:44:13
 */
import store from '@/store';
import { Message } from 'element-ui';

// let url = 'ws://183.230.9.103:8501/websocket/';
let url = 'wss://file.cyitce.com/wss/websocket/';

let ws;
let tt;
let lockReconnect = false; //避免重复连接
let id = '';

let websocket = {
  Init: function (clientId) {
    id = clientId;

    if ('WebSocket' in window) {
      ws = new WebSocket(url + clientId);
    } else if ('MozWebSocket' in window) {
      ws = new MozWebSocket(url + clientId);
    } else {
      console.log('您的浏览器不支持 WebSocket!');
      return;
    }

    ws.onmessage = function (e) {
      console.log('websocket:', e);
      heartCheck.start();
      // 将非心跳信息存入vuex
      if (!e.data.includes('HeartBeat')) {
        store.commit('user/SET_MESSAGE_NOREAD', JSON.parse(e.data));
      }
      //messageHandle(e.data)
    };

    ws.onclose = function () {
      console.log('websocket 连接已关闭');
      // Message({
      //   message: '连接已关闭',
      //   type: 'error',
      // });
      reconnect(clientId);
    };

    ws.onopen = function () {
      store.commit('user/SET_MESSAGE_NOREAD', 'clear');
      // Message({
      //   message: 'websocket 连接成功',
      //   type: 'success',
      // });
      heartCheck.start();
    };

    ws.onerror = function (e) {
      console.log('websocket 数据传输发生错误');
      // Message({
      //   message: 'websocket 数据传输发生错误',
      //   type: 'warning',
      // });
      reconnect(clientId);
    };
  },
  Send: function (sender, reception, body, flag) {
    let data = {
      sender: sender,
      reception: reception,
      body: body,
      flag: flag,
    };
    let msg = JSON.stringify(data);
    ws.send(msg);
  },
  getWebSocket() {
    return ws;
  },
  getStatus() {
    if (ws.readyState == 0) {
      return '未连接';
    } else if (ws.readyState == 1) {
      return '已连接';
    } else if (ws.readyState == 2) {
      return '连接正在关闭';
    } else if (ws.readyState == 3) {
      return '连接已关闭';
    }
  },
  disConnected() {
    console.log('websocket 已断开');
    ws.close();
    // Message({
    //   message: 'websocket 已断开',
    //   type: 'warning',
    // });
  },
};

export default websocket;

//根据消息标识做不同的处理
function messageHandle(message) {
  let msg = JSON.parse(message);
  switch (msg.flag) {
    case 'command':
      console.log('指令消息类型');
      break;
    case 'inform':
      console.log('通知');
      break;
    default:
      console.log('未知消息类型');
  }
}

function reconnect(sname) {
  if (lockReconnect) {
    return;
  }
  lockReconnect = true;
  //没连接上会一直重连，设置延迟避免请求过多
  tt && clearTimeout(tt);
  tt = setTimeout(function () {
    console.log('执行断线重连...');
    websocket.Init(sname);
    lockReconnect = false;
  }, 4000);
}

//心跳检测
let heartCheck = {
  timeout: 1000 * 60 * 3,
  timeoutObj: null,
  serverTimeoutObj: null,
  start: function () {
    let self = this;
    this.timeoutObj && clearTimeout(this.timeoutObj);
    this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
    this.timeoutObj = setTimeout(function () {
      //这里发送一个心跳，后端收到后，返回一个心跳消息，
      //onmessage拿到返回的心跳就说明连接正常
      console.log('心跳检测...');
      ws.send('HeartBeat:' + id);
      self.serverTimeoutObj = setTimeout(function () {
        if (ws.readyState != 1) {
          ws.close();
        }
        // createWebSocket();
      }, self.timeout);
    }, this.timeout);
  },
};
