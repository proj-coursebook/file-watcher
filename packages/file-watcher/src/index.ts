import { FileWatcher, WatchOptions } from "./types";

class FileWatcherImpl implements FileWatcher {
  watch(options: WatchOptions, onChange: (path: string) => Promise<void>): void {
    throw new Error("Method not implemented.");
  }
}

export { FileWatcherImpl };