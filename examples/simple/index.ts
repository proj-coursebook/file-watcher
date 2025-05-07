import {
  FileWatcherImpl,
  type FileWatcher,
  type WatchCommander,
} from "@coursebook/file-watcher";

const fileWatcher: FileWatcher = new FileWatcherImpl({ source: "./source" });

const commander: WatchCommander = {
  enableWatch: () => true,
};

fileWatcher.watch(commander, async (path) => {
  console.log(`File changed: ${path}`);
});

// Run this script with npm run start, 
// then create/update/delete files in the ./source directory to see the output.
// Stop the script with ctrl+c.