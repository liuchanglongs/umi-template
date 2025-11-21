import { throttle } from "lodash-es";

// 通信类型枚举（扩展清晰）
export type CrossType = "broadCastChannel" | "localStorage";

//  BroadcastChannel 通信管理类
class BroadcastChannelCross {
  public channelId: string;
  private channel: BroadcastChannel;
  private parent: MyChannelCrossTabMessage;

  constructor(channelId: string, parent: MyChannelCrossTabMessage) {
    this.channelId = channelId;
    this.channel = new BroadcastChannel(channelId);
    this.parent = parent;
  }

  // 发送消息
  sendMessage<T>(message: T): void {
    try {
      this.channel.postMessage(JSON.stringify(message));
      if (this.parent.permist) {
        this.parent.storage?.setData(message);
      }
    } catch (error) {
      console.error("BroadcastChannel 发送消息失败:", error);
    }
  }

  // 节流发送消息
  throttleSendMessage<T>(message: T): void {
    throttle(() => this.sendMessage(message), 1500);
  }

  /**
   * 注册消息回调
   * listenerFn：为啥传函数。因为vue与react中的数据更新方式一样，所以直接抛出函数调用，得到的数据外部处理
   * */
  onMessage<T>(listenerFn: (data: T) => void): void {
    this.channel.addEventListener("message", (event) => {
      listenerFn(JSON.parse(event.data));
    });
  }

  // 关闭通道（释放资源）
  close(): void {
    this.channel.close();
  }
}

//  LocalStorage 通信管理类
class LocalStorageChannel {
  public channelId: string;
  private parent: MyChannelCrossTabMessage;
  private fn: any;
  constructor(channelId: string, parent: MyChannelCrossTabMessage) {
    this.channelId = channelId;
    this.parent = parent;
  }

  // 发送消息
  sendMessage<T>(message: T): void {
    try {
      this.parent.storage?.setData(message);
    } catch (error) {
      console.error("LocalStorageChannel 发送消息失败:", error);
    }
  }

  // 节流发送消息
  throttleSendMessage<T>(message: T): void {
    throttle(() => this.sendMessage(message), 1500);
  }

  // 注册消息回调
  onMessage<T>(listenerFn: (data: T) => void): void {
    this.fn = (event: StorageEvent) => {
      // 只处理我们的消息
      if (event.key === this.parent.storage?.storagekey) {
        try {
          if (event.newValue) {
            const newValue = JSON.parse(event.newValue);
            listenerFn(newValue[this.parent.channelId] || null);
          } else {
            listenerFn(null);
          }
        } catch (error) {
          console.error("解析消息失败:", error);
        }
      }
    };
    window.addEventListener("storage", this.fn);
  }

  // 关闭通道（释放资源）
  close(): void {
    this.fn && window.removeEventListener("resize", this.fn);
  }
}

// 浏览器存储管理
class StorageManager {
  public storagekey: string;
  private parent: MyChannelCrossTabMessage;
  constructor(
    parent: MyChannelCrossTabMessage,
    storagekey: string = "form_storage_key"
  ) {
    this.storagekey = storagekey;
    this.parent = parent;
  }
  setData<T>(message: T) {
    const formId = this.parent.channelId;
    const str = this.getData();
    if (str) {
      const data = JSON.parse(str);
      localStorage.setItem(
        this.storagekey,
        JSON.stringify({ ...data, [formId]: message })
      );
    } else {
      localStorage.setItem(
        this.storagekey,
        JSON.stringify({ [formId]: message })
      );
    }
  }

  getData(): string | null {
    return localStorage.getItem(this.storagekey);
  }

  clearData(formId: string) {
    const str = this.getData();
    if (str) {
      const data = JSON.parse(str);
      delete data[formId];
      localStorage.setItem(this.storagekey, JSON.stringify(data));
    }
  }

  clearall() {
    localStorage.removeItem(this.storagekey);
  }
}

// 跨标签页通信统一管理类（调度两种通信方式）
export type CurrentChannelType =
  | BroadcastChannelCross
  | LocalStorageChannel
  | null;
class MyChannelCrossTabMessage {
  public channelId: string;
  public type: CrossType;
  public storage: StorageManager | null = null;
  public currentChannel: CurrentChannelType = null;
  public permist: boolean;

  constructor(
    channelId: string,
    type: CrossType = "broadCastChannel",
    permist: boolean = true
  ) {
    this.channelId = channelId;
    this.type = type;
    this.permist = permist;
    this.registerStorageManager();
  }

  // 异步初始化（验证兼容性 + 选择通信方式）
  async init(): Promise<BroadcastChannelCross | LocalStorageChannel> {
    if (this.type === "broadCastChannel") {
      const supportResult = await this.validateBroadcastChannelSupport();
      if (supportResult.supported) {
        this.currentChannel = new BroadcastChannelCross(this.channelId, this);
        console.log(
          `✅ 已初始化 BroadcastChannel 通信（通道ID: ${this.channelId}）`
        );
        return this.currentChannel;
      } else {
        console.warn(
          `❌ BroadcastChannel 不支持，自动降级为 localStorage: ${supportResult.error}`
        );
        this.type = "localStorage";
      }
    }

    // 初始化 localStorage 通信
    this.type = "localStorage";
    this.currentChannel = new LocalStorageChannel(this.channelId, this);
    console.log(`✅ 已初始化 LocalStorage 通信（通道ID: ${this.channelId}）`);
    return this.currentChannel;
  }

  registerStorageManager() {
    if (this.type === "broadCastChannel" && this.permist) {
      this.storage = new StorageManager(this);
    }
    if (this.type === "localStorage") {
      this.storage = new StorageManager(this);
    }
  }

  // 验证 BroadcastChannel 兼容性（复用之前的逻辑）
  validateBroadcastChannelSupport(): Promise<{
    supported: boolean;
    error: string | null;
  }> {
    if (typeof window === "undefined") {
      return Promise.resolve({
        supported: false,
        error: "非浏览器环境，不支持 BroadcastChannel",
      });
    }

    if (typeof BroadcastChannel === "undefined") {
      return Promise.resolve({
        supported: false,
        error: "浏览器不支持 BroadcastChannel（如 IE）",
      });
    }

    return new Promise((resolve) => {
      try {
        // 仅验证实例化、postMessage、close 方法是否可用（无异常即视为支持）
        const testChannel = new BroadcastChannel("__broadcast_test__");
        testChannel.postMessage("test"); // 无异常即可，无需接收
        testChannel.close(); // 立即关闭，释放资源
        resolve({ supported: true, error: null });
      } catch (error) {
        resolve({
          supported: false,
          error: `实例化失败: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      }
    });
  }
}

export { MyChannelCrossTabMessage };
