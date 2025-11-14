/**
 * Storage adapter that automatically detects and uses the appropriate
 * storage mechanism based on the platform (web or React Native)
 */

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

/**
 * Detects if we're running in a React Native environment
 */
function isReactNative(): boolean {
  return (
    typeof navigator !== "undefined" && navigator.product === "ReactNative"
  );
}

/**
 * Detects if we're running in a browser/web environment
 */
function isWeb(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

/**
 * Web storage adapter using localStorage
 */
class WebStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("[ReactAnalytics] Error reading from localStorage:", error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("[ReactAnalytics] Error writing to localStorage:", error);
    }
  }
}

/**
 * React Native storage adapter using AsyncStorage
 */
class ReactNativeStorageAdapter implements StorageAdapter {
  private asyncStorage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
  } | null;

  constructor() {
    try {
      // Dynamically import AsyncStorage to avoid errors when not available
      this.asyncStorage =
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require("@react-native-async-storage/async-storage").default;
    } catch {
      console.warn(
        "[ReactAnalytics] AsyncStorage not found. Install @react-native-async-storage/async-storage for persistent storage in React Native.",
      );
      this.asyncStorage = null;
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.asyncStorage) {
      return null;
    }

    try {
      return await this.asyncStorage.getItem(key);
    } catch (error) {
      console.error("[ReactAnalytics] Error reading from AsyncStorage:", error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.asyncStorage) {
      return;
    }

    try {
      await this.asyncStorage.setItem(key, value);
    } catch (error) {
      console.error("[ReactAnalytics] Error writing to AsyncStorage:", error);
    }
  }
}

/**
 * In-memory storage adapter (fallback when no storage is available)
 */
class InMemoryStorageAdapter implements StorageAdapter {
  private storage: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }
}

/**
 * Creates and returns the appropriate storage adapter based on the platform
 */
export function createStorageAdapter(): StorageAdapter {
  if (isWeb()) {
    return new WebStorageAdapter();
  }

  if (isReactNative()) {
    return new ReactNativeStorageAdapter();
  }

  // Fallback to in-memory storage (e.g., SSR, Node.js environments)
  console.warn(
    "[ReactAnalytics] No storage mechanism detected. Using in-memory storage (data will not persist).",
  );
  return new InMemoryStorageAdapter();
}
