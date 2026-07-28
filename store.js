// store.js
export const Store = {
  get(key, defaultValue) {
    const val = localStorage.getItem(key);
    if (val === null) return defaultValue;
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};
