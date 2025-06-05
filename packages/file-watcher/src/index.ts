import { watch, type ChokidarOptions } from "chokidar";
import {
  type FileWatcher,
  type WatchOptions,
  FileWatcherError,
  FileWatcherErrorType,
  type LogLevel,
} from "./types";
import {
  type LogManager,
  LogManagerImpl,
  type Logger,
} from "@coursebook/simple-logger";
import micromatch from "micromatch";

const chokidarOptions: ChokidarOptions = {
  cwd: ".", // The base directory from which watch paths are to be derived. Paths emitted with events will be relative to this.
  persistent: true, // The watcher will keep running indefinitely, allowing you to continuously listen for file changes.
  awaitWriteFinish: true, // Waits for a file to finish being written before triggering events. This is useful if a file is being processed over time (e.g., large files).
  atomic: true, // Automatically filters out artifacts that occur when using editors that use "atomic writes" instead of writing directly to the source file.
  usePolling: false, // Enables polling to check for file changes instead of relying on native file system events. This is more resource-intensive but may be necessary in environments where file system events are unreliable.
  ignoreInitial: true, // Ignore the initial add events when it starts. This is useful if you only want to process changes after the watcher has been initialized.
  ignorePermissionErrors: true, // Ignores files that the watcher cannot access due to permission errors.
  followSymlinks: true, // Looks at changes to the file the symlink points to rather than the symlink itself
};

/**
 * Implementation of the file watcher
 */
class FileWatcherImpl implements FileWatcher {
  private watchOptions: WatchOptions;
  private logManager: LogManager;
  private logger: Logger;

  constructor(options: WatchOptions) {
    this.logManager = LogManagerImpl.getInstance();
    this.logger = this.logManager.getLogger("file-watcher");
    this.watchOptions = this.validateAndInitializeWatcherOptions(options);
  }

  setLogLevel(level: LogLevel) {
    this.logManager.setLogLevel("file-watcher", level);
  }

  private validateAndInitializeWatcherOptions(
    options: WatchOptions,
  ): WatchOptions {
    if (!options.source) {
      throw new FileWatcherError(
        FileWatcherErrorType.CONFIG_ERROR,
        "Source is required",
      );
    }

    return {
      source: options.source,
      // include: options.include ?? ["**/*"],
      exclude: options.exclude ?? [],
      usePolling: options.usePolling ?? chokidarOptions.usePolling,
    };
  }

  private getChokidarOptions(): ChokidarOptions {
    return {
      ...chokidarOptions,
      ignored: (path) => {
        this.logger.trace(`Checking if ${path} should be ignored.`);
        if (micromatch.isMatch(path, this.watchOptions.exclude!)) {
          this.logger.trace(`${path} matches exclude pattern.`);
          return true;
        }
        this.logger.trace(`${path} does not match the exclude pattern.`);
        return false;
      },
    };
  }

  watch(onChange: (path: string) => Promise<void>): void {
    try {
      const chokidarOptions = this.getChokidarOptions();
      const watcher = watch(this.watchOptions.source, chokidarOptions);
      this.logger.info(`Watching ${this.watchOptions.source}.`);
      watcher.on("all", async (event, path) => {
        this.logger.trace(`File ${path} has been ${event}.`);
        await onChange(path);
      });
    } catch (error) {
      this.logger.error("Error watching files.", error);
      throw new FileWatcherError(
        FileWatcherErrorType.WATCH_ERROR,
        "Error watching files.",
        error as Error,
      );
    }
  }
}

// Export types for use in other packages
export type { FileWatcher, WatchOptions, LogLevel };

// Export the implementation for use in other packages
export { FileWatcherImpl };
