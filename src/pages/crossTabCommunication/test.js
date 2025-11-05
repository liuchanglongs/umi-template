class FormStorageManager {
  static instances = [];
  static isInitialized = false;

  // 注册实例并初始化全局事件监听
  static register(instance) {
    this.instances.push(instance);
    if (!this.isInitialized) {
      window.addEventListener("beforeunload", this.saveAll);
      document.addEventListener(
        "visibilitychange",
        this.handleVisibilityChange
      );
      this.isInitialized = true;
    }
  }

  // 批量保存所有实例的表单数据
  static saveAll() {
    this.instances.forEach((instance) => instance.saveData());
  }

  // 页面隐藏时触发批量保存
  static handleVisibilityChange() {
    if (document.visibilityState === "hidden") {
      this.saveAll();
    }
  }
}

class FormStorage {
  constructor(formId, formData) {
    this.formId = formId;
    this.storageKey = `formData_${formId}`;
    this.formData = formData;
    this.channel = new BroadcastChannel("form_sync");
    // 防抖处理：3000ms 内多次调用会合并为一次
    this.debouncedSaveData = this.debounce(this.saveData, 3000).bind(this);
    // 注册到管理类以支持全局事件
    FormStorageManager.register(this);

    // 监听跨页面数据同步消息
    this.channel.onmessage = (event) => {
      const { formId, data } = JSON.parse(event.data);
      if (formId === this.formId) {
        this.syncData(data);
      } else if (formId === "all") {
        this.clearData();
      }
    };
  }

  // 初始化：从本地存储加载数据
  init() {
    this.loadData();
  }

  // 保存数据到 localStorage 并广播同步消息
  saveData() {
    const data = JSON.stringify(this.formData.value);
    localStorage.setItem(this.storageKey, data);
    this.channel.postMessage(
      JSON.stringify({ formId: this.formId, data: this.formData.value })
    );
  }

  // 防抖函数：用于控制 saveData 的调用频率
  debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // 从 localStorage 加载数据（需补充实现）
  loadData() {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      this.formData.value = JSON.parse(data);
    }
  }

  // 同步跨页面数据（需补充实现）
  syncData(data) {
    this.formData.value = data;
  }

  // 清除本地数据（需补充实现）
  clearData() {
    localStorage.removeItem(this.storageKey);
    this.formData.value = {}; // 清空表单数据
  }
}
