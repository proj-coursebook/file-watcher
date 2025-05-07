
export const watchEvents = ['add', 'addDir', 'change', 'unlink', 'unlinkDir'] as const;

type WatchEvent = typeof watchEvents[number];

interface WatchCommander {
  enableWatch: () => boolean;
}

interface WatchOptions {
  /** Source directory to watch */
  source: string;
  /** Patterns to watch, relative to source directory */
  include?: string[];
  /** Patterns to ignore, relative to source directory */
  exclude?: string[];
}

interface FileWatcher {
  watch(commander: WatchCommander, onChange: (path: string) => Promise<void>): void;
}

export type { FileWatcher, WatchOptions, WatchCommander, WatchEvent };