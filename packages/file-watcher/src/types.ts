import { type LogLevel } from "@coursebook/simple-logger";

/**
 * Options for the file watcher
 */
interface WatchOptions {
  /** Source directory to watch */
  source: string | string[];
  /** Patterns to watch, relative to source directory */
  // include?: string | string[]; // TODO: add this back in
  /** Patterns to ignore, relative to source directory */
  exclude?: string | string[];
  /** Whether to use polling instead of native watchers */
  usePolling?: boolean;
}

/**
 * Interface for the file watcher
 */
interface FileWatcher {
  /**
   * Watch the file watcher
   * @param onChange - The function to call when a file changes
   */
  watch(onChange: (path: string) => Promise<void>): void;

  /**
   * Set the log level for the file watcher
   * @param level - The log level to set
   */
  setLogLevel(level: LogLevel): void;
}

/**
 * Error types specific to file watching operations
 */
enum FileWatcherErrorType {
  WATCH_ERROR = "WATCH_ERROR",
  CONFIG_ERROR = "CONFIG_ERROR",
}

/**
 * Error class for file watching operations
 */
class FileWatcherError extends Error {
  constructor(
    public type: FileWatcherErrorType,
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "FileWatcherError";
  }
}

export type { FileWatcher, WatchOptions, LogLevel };

export { FileWatcherError, FileWatcherErrorType };
