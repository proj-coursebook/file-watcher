import { FileWatcherImpl, type FileWatcher } from "@coursebook/file-watcher";

const fileWatcher: FileWatcher = new FileWatcherImpl({
  source: "./source-folder",
  // exclude any file that includes "tmp" in the name
  exclude: ["**/*tmp*"],
});

fileWatcher.setLogLevel("info"); // set to trace to see more detailed logs

fileWatcher.watch(async (path) => {
  // Do something with the file
  console.log(`File changed: ${path}`);
});

// Run this script with npm run start,
// then create/update/delete files in the ./source-folder directory to see the output.
// Stop the script with ctrl+c.
