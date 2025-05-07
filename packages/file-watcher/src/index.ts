import { watch, type FSWatcher } from "chokidar";
import {
  FileWatcher,
  WatchOptions,
  WatchCommander,
  WatchEvent,
  watchEvents,
} from "./types";

class FileWatcherImpl implements FileWatcher {
  private watcher: FSWatcher;

  constructor(options: WatchOptions) {
    this.watcher = watch(options.source);
  }

  watch(
    commander: WatchCommander,
    onChange: (path: string) => Promise<void>,
  ): void {
    if (!commander.enableWatch()) {
      return;
    }

    this.watcher.on("all", async (event, path) => {
      if (watchEvents.includes(event as WatchEvent)) {
        console.log(`Event ${event} is valid.`);
        await onChange(path);
      }
    });
  }
}

// Export types for use in other packages
export type { FileWatcher, WatchOptions, WatchCommander, WatchEvent };

// Export the implementation for use in other packages
export { FileWatcherImpl };
