import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FileWatcherImpl } from "../src";
import { FileWatcherError, FileWatcherErrorType } from "../src/types";

// Create mock instances that can be reused
const mockWatcher = {
  on: vi.fn().mockReturnThis(),
  __trigger: vi.fn(),
};

const mockLogger = {
  trace: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
};

const mockLogManager = {
  getLogger: vi.fn(() => mockLogger),
  setLogLevel: vi.fn(),
};

// Mock chokidar
vi.mock("chokidar", () => ({
  watch: vi.fn(() => mockWatcher),
}));

// Mock logger
vi.mock("@coursebook/simple-logger", () => ({
  LogManagerImpl: {
    getInstance: () => mockLogManager,
  },
}));

// Mock micromatch
vi.mock("micromatch", () => ({
  default: {
    isMatch: vi.fn(),
  },
}));

const { watch } = await import("chokidar");
const micromatch = await import("micromatch");

describe("FileWatcherImpl", () => {
  let fileWatcher: FileWatcherImpl;
  let onChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    onChange = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create an instance", () => {
      fileWatcher = new FileWatcherImpl({ source: "./test" });
      expect(fileWatcher).toBeInstanceOf(FileWatcherImpl);
      expect(mockLogManager.getLogger).toHaveBeenCalledWith("file-watcher");
    });

    it("should throw error when source is missing", () => {
      expect(() => {
        // @ts-expect-error - intentionally testing missing source
        new FileWatcherImpl({});
      }).toThrow(FileWatcherError);
    });

    it("should throw ConfigError with correct type when source is missing", () => {
      try {
        // @ts-expect-error - intentionally testing missing source
        new FileWatcherImpl({});
      } catch (error) {
        expect(error).toBeInstanceOf(FileWatcherError);
        expect((error as FileWatcherError).type).toBe(
          FileWatcherErrorType.CONFIG_ERROR,
        );
        expect((error as FileWatcherError).message).toBe("Source is required");
      }
    });

    it("should accept string source", () => {
      fileWatcher = new FileWatcherImpl({ source: "./test" });
      expect(fileWatcher).toBeInstanceOf(FileWatcherImpl);
    });

    it("should accept array source", () => {
      fileWatcher = new FileWatcherImpl({ source: ["./test1", "./test2"] });
      expect(fileWatcher).toBeInstanceOf(FileWatcherImpl);
    });

    it("should use default options when not provided", () => {
      fileWatcher = new FileWatcherImpl({ source: "./test" });
      expect(fileWatcher).toBeInstanceOf(FileWatcherImpl);
    });

    it("should use provided exclude patterns", () => {
      fileWatcher = new FileWatcherImpl({
        source: "./test",
        exclude: ["**/*.log", "node_modules/**"],
      });
      expect(fileWatcher).toBeInstanceOf(FileWatcherImpl);
    });

    it("should use provided usePolling option", () => {
      fileWatcher = new FileWatcherImpl({
        source: "./test",
        usePolling: true,
      });
      expect(fileWatcher).toBeInstanceOf(FileWatcherImpl);
    });
  });

  describe("setLogLevel", () => {
    beforeEach(() => {
      fileWatcher = new FileWatcherImpl({ source: "./test" });
    });

    it("should call logManager.setLogLevel with correct parameters", () => {
      fileWatcher.setLogLevel("trace");
      expect(mockLogManager.setLogLevel).toHaveBeenCalledWith(
        "file-watcher",
        "trace",
      );
    });

    it("should accept different log levels", () => {
      const levels = ["trace", "debug", "info", "warn", "error"] as const;

      levels.forEach((level) => {
        fileWatcher.setLogLevel(level);
        expect(mockLogManager.setLogLevel).toHaveBeenCalledWith(
          "file-watcher",
          level,
        );
      });
    });
  });

  describe("watch", () => {
    beforeEach(() => {
      fileWatcher = new FileWatcherImpl({ source: "./test" });
    });

    it("should start watching with chokidar", () => {
      fileWatcher.watch(onChange);

      expect(watch).toHaveBeenCalledWith(
        "./test",
        expect.objectContaining({
          cwd: ".",
          persistent: true,
          awaitWriteFinish: true,
          atomic: true,
          usePolling: false,
          ignoreInitial: true,
          ignorePermissionErrors: true,
          followSymlinks: true,
        }),
      );
    });

    it("should log info message when starting to watch", () => {
      fileWatcher.watch(onChange);
      expect(mockLogger.info).toHaveBeenCalledWith("Watching ./test.");
    });

    it("should register 'all' event listener", () => {
      fileWatcher.watch(onChange);
      expect(mockWatcher.on).toHaveBeenCalledWith("all", expect.any(Function));
    });

    it("should call onChange when file event occurs", async () => {
      fileWatcher.watch(onChange);

      // Get the callback function that was registered
      const eventCallback = mockWatcher.on.mock.calls[0][1];

      // Simulate file change event
      await eventCallback("change", "test.txt");

      expect(onChange).toHaveBeenCalledWith("test.txt");
      expect(mockLogger.trace).toHaveBeenCalledWith(
        "File test.txt has been change.",
      );
    });

    it("should handle different event types", async () => {
      fileWatcher.watch(onChange);
      const eventCallback = mockWatcher.on.mock.calls[0][1];

      const events = ["add", "change", "unlink", "addDir", "unlinkDir"];

      for (const event of events) {
        await eventCallback(event, "test.txt");
        expect(onChange).toHaveBeenCalledWith("test.txt");
      }
    });

    it("should handle async onChange function", async () => {
      const asyncOnChange = vi.fn().mockImplementation(async (path: string) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return `processed ${path}`;
      });

      fileWatcher.watch(asyncOnChange);
      const eventCallback = mockWatcher.on.mock.calls[0][1];

      await eventCallback("change", "test.txt");

      expect(asyncOnChange).toHaveBeenCalledWith("test.txt");
    });

    it("should throw FileWatcherError when watch fails", () => {
      // Mock chokidar.watch to throw an error
      vi.mocked(watch).mockImplementationOnce(() => {
        throw new Error("Watch failed");
      });

      expect(() => {
        fileWatcher.watch(onChange);
      }).toThrow(FileWatcherError);
    });

    it("should throw FileWatcherError with correct type when watch fails", () => {
      vi.mocked(watch).mockImplementationOnce(() => {
        throw new Error("Watch failed");
      });

      try {
        fileWatcher.watch(onChange);
      } catch (error) {
        expect(error).toBeInstanceOf(FileWatcherError);
        expect((error as FileWatcherError).type).toBe(
          FileWatcherErrorType.WATCH_ERROR,
        );
        expect((error as FileWatcherError).message).toBe(
          "Error watching files.",
        );
        expect((error as FileWatcherError).cause).toBeInstanceOf(Error);
      }
    });

    it("should log error when watch fails", () => {
      const originalError = new Error("Watch failed");
      vi.mocked(watch).mockImplementationOnce(() => {
        throw originalError;
      });

      try {
        fileWatcher.watch(onChange);
      } catch {
        expect(mockLogger.error).toHaveBeenCalledWith(
          "Error watching files.",
          originalError,
        );
      }
    });
  });

  describe("file exclusion", () => {
    it("should exclude files matching exclude patterns", () => {
      fileWatcher = new FileWatcherImpl({
        source: "./test",
        exclude: ["**/*.log"],
      });

      // Mock micromatch to return true for excluded files
      vi.mocked(micromatch.default.isMatch).mockImplementation(
        (path: string, patterns: string[]) => {
          return path.endsWith(".log");
        },
      );

      fileWatcher.watch(onChange);

      // Get the ignored function from chokidar options
      const chokidarCall = vi.mocked(watch).mock.calls[0];
      const options = chokidarCall[1];
      const ignoredFn = options.ignored as (path: string) => boolean;

      expect(ignoredFn("test.log")).toBe(true);
      expect(ignoredFn("test.txt")).toBe(false);
    });

    it("should log trace messages for exclude pattern checking", () => {
      fileWatcher = new FileWatcherImpl({
        source: "./test",
        exclude: ["**/*.log"],
      });

      vi.mocked(micromatch.default.isMatch).mockReturnValue(false);

      fileWatcher.watch(onChange);

      const chokidarCall = vi.mocked(watch).mock.calls[0];
      const options = chokidarCall[1];
      const ignoredFn = options.ignored as (path: string) => boolean;

      ignoredFn("test.txt");

      expect(mockLogger.trace).toHaveBeenCalledWith(
        "Checking if test.txt should be ignored.",
      );
      expect(mockLogger.trace).toHaveBeenCalledWith(
        "test.txt does not match the exclude pattern.",
      );
    });

    it("should log when file matches exclude pattern", () => {
      fileWatcher = new FileWatcherImpl({
        source: "./test",
        exclude: ["**/*.log"],
      });

      vi.mocked(micromatch.default.isMatch).mockReturnValue(true);

      fileWatcher.watch(onChange);

      const chokidarCall = vi.mocked(watch).mock.calls[0];
      const options = chokidarCall[1];
      const ignoredFn = options.ignored as (path: string) => boolean;

      ignoredFn("test.log");

      expect(mockLogger.trace).toHaveBeenCalledWith(
        "test.log matches exclude pattern.",
      );
    });

    it("should handle multiple exclude patterns", () => {
      fileWatcher = new FileWatcherImpl({
        source: "./test",
        exclude: ["**/*.log", "**/*.tmp", "node_modules/**"],
      });

      expect(fileWatcher).toBeInstanceOf(FileWatcherImpl);
    });

    it("should use empty array as default exclude when not provided", () => {
      fileWatcher = new FileWatcherImpl({ source: "./test" });

      vi.mocked(micromatch.default.isMatch).mockReturnValue(false);

      fileWatcher.watch(onChange);

      const chokidarCall = vi.mocked(watch).mock.calls[0];
      const options = chokidarCall[1];
      const ignoredFn = options.ignored as (path: string) => boolean;

      expect(ignoredFn("any-file.txt")).toBe(false);
      expect(micromatch.default.isMatch).toHaveBeenCalledWith(
        "any-file.txt",
        [],
      );
    });
  });

  describe("chokidar options", () => {
    it("should use custom usePolling option", () => {
      fileWatcher = new FileWatcherImpl({
        source: "./test",
        usePolling: true,
      });

      fileWatcher.watch(onChange);

      expect(watch).toHaveBeenCalledWith(
        "./test",
        expect.objectContaining({
          usePolling: true,
        }),
      );
    });

    it("should use default usePolling when not provided", () => {
      fileWatcher = new FileWatcherImpl({ source: "./test" });

      fileWatcher.watch(onChange);

      expect(watch).toHaveBeenCalledWith(
        "./test",
        expect.objectContaining({
          usePolling: false,
        }),
      );
    });

    it("should pass correct chokidar options", () => {
      fileWatcher = new FileWatcherImpl({ source: "./test" });
      fileWatcher.watch(onChange);

      expect(watch).toHaveBeenCalledWith(
        "./test",
        expect.objectContaining({
          cwd: ".",
          persistent: true,
          awaitWriteFinish: true,
          atomic: true,
          ignoreInitial: true,
          ignorePermissionErrors: true,
          followSymlinks: true,
          ignored: expect.any(Function),
        }),
      );
    });
  });
});
