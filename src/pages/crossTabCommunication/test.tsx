// 定义表单数据的通用接口（键为字符串，值为任意可序列化类型）
interface FormDataValue {
  [key: string]: string | number | boolean | null | undefined;
}

// 表单数据包装类型（包含响应式.value属性）
interface FormDataWrapper<T extends FormDataValue> {
  value: T;
}

class FormStorage<T extends FormDataValue> {
  public formId: string;
  public storageKey: string;
  public formData: FormDataWrapper<T>;
  public channel: BroadcastChannel;
  public debouncedSaveData: (...args: any[]) => void;

  constructor(formId: string, formData: FormDataWrapper<T>) {
    this.formId = formId;
    this.storageKey = `formData_${formId}`;
    this.formData = formData;
    this.channel = new BroadcastChannel("form_sync");

    // 注册到管理类
    FormStorageManager.register(this);

    // 防抖处理：绑定当前实例作为this
    this.debouncedSaveData = this.debounce(this.saveData, 3000).bind(this);

    // 监听跨页面同步消息
    this.channel.onmessage = (event: MessageEvent) => {
      try {
        const parsedData: { formId: string; data: T | null } = JSON.parse(
          event.data
        );
        const { formId, data } = parsedData;

        if (formId === this.formId) {
          this.syncData(data);
        } else if (formId === "all") {
          this.clearData();
        }
      } catch (error) {
        console.error("Failed to parse broadcast message:", error);
      }
    };
  }

  // 初始化：从本地存储加载数据
  init(): void {
    this.loadData();
  }

  // 保存数据到localStorage并广播
  saveData(): void {
    // 处理响应式数据克隆问题（如Vue的Proxy）
    const plainData = JSON.parse(JSON.stringify(this.formData.value)) as T;
    localStorage.setItem(this.storageKey, JSON.stringify(plainData));
    this.channel.postMessage(
      JSON.stringify({
        formId: this.formId,
        data: plainData,
      })
    );
  }

  // 防抖函数
  debounce(
    func: (...args: any[]) => void,
    wait: number
  ): (...args: any[]) => void {
    let timeout: NodeJS.Timeout | null = null;
    return function (this: FormStorage<T>, ...args: any[]) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(this, args);
      }, wait);
    };
  }

  // 加载本地存储数据
  loadData(): void {
    const savedStr = localStorage.getItem(this.storageKey);
    if (savedStr) {
      try {
        const savedData = JSON.parse(savedStr) as T;
        for (const key in savedData) {
          if (
            Object.prototype.hasOwnProperty.call(savedData, key) &&
            Object.prototype.hasOwnProperty.call(this.formData.value, key)
          ) {
            this.formData.value[key] = savedData[key];
          }
        }
      } catch (error) {
        console.error("Failed to parse saved form data:", error);
      }
    }
  }

  // 同步其他标签页数据
  syncData(data: T | null): void {
    if (data) {
      for (const key in data) {
        if (
          Object.prototype.hasOwnProperty.call(data, key) &&
          Object.prototype.hasOwnProperty.call(this.formData.value, key)
        ) {
          this.formData.value[key] = data[key];
        }
      }
    }
  }

  // 清除数据并广播
  clearData(): void {
    localStorage.removeItem(this.storageKey);
    this.channel.postMessage(
      JSON.stringify({
        formId: this.formId,
        data: null,
      })
    );
  }
}

class FormStorageManager {
  private static instances: FormStorage<FormDataValue>[] = [];
  private static isInitialized: boolean = false;

  // 注册实例并初始化全局事件
  static register(instance: FormStorage<FormDataValue>): void {
    this.instances.push(instance);
    if (!this.isInitialized) {
      // 绑定静态方法的this指向
      window.addEventListener("beforeunload", () => this.saveAll());
      document.addEventListener("visibilitychange", () =>
        this.handleVisibilityChange()
      );
      this.isInitialized = true;
    }
  }

  // 批量保存所有表单数据
  static saveAll(): void {
    this.instances.forEach((instance) => instance.saveData());
  }

  // 页面隐藏时保存数据
  static handleVisibilityChange(): void {
    if (document.visibilityState === "hidden") {
      this.saveAll();
    }
  }
}

export { FormStorage, FormDataValue, FormDataWrapper };
