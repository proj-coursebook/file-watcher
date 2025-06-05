import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FileWatcherImpl } from "../src";
import { FileWatcherError, FileWatcherErrorType } from "../src/types";

// Mock chokidar
vi.mock("chokidar", () => {
  return {
    watch: vi.fn(() => {
      const listeners: Record<string, Function[]> = {};
      return {
        on: (event: string, cb: Function) => {
          listeners[event] = listeners[event] || [];
          listeners[event].push(cb);
          return this;
        },
        // Helper to trigger events in tests
        __trigger: (event: string, ...args: any[]) => {
          (listeners[event] || []).forEach((fn) => fn(...args));
          (listeners["all"] || []).forEach((fn) => fn(event, ...args));
        },
      };
    }),
  };
});

// Mock logger
vi.mock("@coursebook/simple-logger", () => {
  return {
    LogManagerImpl: {
      getInstance: () => ({
        getLogger: () => ({
          trace: vi.fn(),
          info: vi.fn(),
          error: vi.fn(),
        }),
        setLogLevel: vi.fn(),
      }),
    },
  };
});

const { watch } = require("chokidar");

describe("FileWatcherImpl", () => {
  let fileWatcher: FileWatcherImpl;
  let onChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fileWatcher = new FileWatcherImpl({ source: "./test" });
    onChange = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should be a function", () => {
    expect(FileWatcherImpl).toBeInstanceOf(Function);
  });

  it("throws if source is missing", () => {
    // @ts-expect-error
    expect(() => new FileWatcherImpl({})).toThrowError(FileWatcherError);
    try {
      // @ts-expect-error
      new FileWatcherImpl({});
    } catch (e) {
      expect(e).toBeInstanceOf(FileWatcherError);
      expect(e.type).toBe(FileWatcherErrorType.CONFIG_ERROR);
    }
  });

  it("sets log level", () => {
    const setLogLevel =
      require("@coursebook/simple-logger").LogManagerImpl.getInstance()
        .setLogLevel;
    fileWatcher.setLogLevel("trace");
    expect(setLogLevel).toHaveBeenCalledWith("file-watcher", "trace");
  });

  it("calls onChange when a file changes", async () => {
    fileWatcher.watch(onChange);
    // Simulate a file change event
    const watcherInstance = (watch as any).mock.results[0].value;
    await watcherInstance.__trigger("change", "foo.txt");
    expect(onChange).toHaveBeenCalledWith("foo.txt");
  });

  it("does not call onChange for excluded files", async () => {
    fileWatcher = new FileWatcherImpl({
      source: "./test",
      exclude: ["**/*.log"],
    });
    fileWatcher.watch(onChange);
    const watcherInstance = (watch as any).mock.results[0].value;
    await watcherInstance.__trigger("change", "foo.log");
    expect(onChange).not.toHaveBeenCalled();
    await watcherInstance.__trigger("change", "foo.txt");
    expect(onChange).toHaveBeenCalledWith("foo.txt");
  });

  it("throws FileWatcherError on watch error", () => {
    // Force getChokidarOptions to throw
    fileWatcher = new FileWatcherImpl({ source: "./test" });
    const spy = vi
      .spyOn(fileWatcher as any, "getChokidarOptions")
      .mockImplementation(() => {
        throw new Error("fail");
      });
    expect(() => fileWatcher.watch(onChange)).toThrowError(FileWatcherError);
    spy.mockRestore();
  });
});
