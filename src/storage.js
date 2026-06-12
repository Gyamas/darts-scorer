// アーティファクト環境の window.storage 互換APIをlocalStorageで提供する。
// claude.ai上では本物のwindow.storageが存在するためこのアダプタは何もしない。
// スタンドアロン(Vite/PWA)ではlocalStorageに同じインターフェースで永続化する。
const PREFIX = "darts-scorer:";

if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(PREFIX + key);
      if (value == null) throw new Error(`key not found: ${key}`);
      return { key, value, shared: false };
    },
    async set(key, value) {
      localStorage.setItem(PREFIX + key, value);
      return { key, value, shared: false };
    },
    async delete(key) {
      localStorage.removeItem(PREFIX + key);
      return { key, deleted: true, shared: false };
    },
    async list(prefix = "") {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX + prefix)) keys.push(k.slice(PREFIX.length));
      }
      return { keys, prefix, shared: false };
    },
  };
}
