interface WatchOptions {
  /** Source directory to watch */
  source: string;
  /** Patterns to watch, relative to source directory */
  include?: string[];
  /** Patterns to ignore, relative to source directory */
  exclude?: string[];
}

interface FileWatcher {
  watch(options: WatchOptions, onChange: (path: string) => Promise<void>): void;
}

export type { FileWatcher, WatchOptions };