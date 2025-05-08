import { watch, type ChokidarOptions } from "chokidar";
import micromatch from "micromatch"; 

const paths = ["./source-1", "./source-2", "./source-3"];
const exclude = ["**/*.{tmp,log}"];

const chokidarOptions: ChokidarOptions = {
  ignored: (path) => micromatch.isMatch(path, exclude), // Runs for each file in the watched directory
  persistent: true, // The watcher will keep running indefinitely, allowing you to continuously listen for file changes. 

  // --- Experiment with options below to see what works best for your use case ---
  cwd: ".", // The base directory from which watch paths are to be derived. Paths emitted with events will be relative to this.
  awaitWriteFinish: true, // Waits for a file to finish being written before triggering events. This is useful if a file is being processed over time (e.g., large files).
  atomic: true, // Automatically filters out artifacts that occur when using editors that use "atomic writes" instead of writing directly to the source file.
  usePolling: false, // Enables polling to check for file changes instead of relying on native file system events. This is more resource-intensive but may be necessary in environments where file system events are unreliable.
  ignoreInitial: true, // Ignore the initial add events when it starts. This is useful if you only want to process changes after the watcher has been initialized.
  ignorePermissionErrors: true, // Ignores files that the watcher cannot access due to permission errors.
  followSymlinks: true, // Looks at changes to the file the symlink points to rather than the symlink itself
};

const watcher = watch(paths, chokidarOptions);

watcher
  .on("all", async (event, path) => {
    console.log("All event:", event, path);
  });

// Run this script with npm run demo-5,
// then create/update/delete files in the folders/files that are being watched to see the output.
// (give it a sec to see the output, especially when using the awaitWriteFinish option)
// Stop the script with ctrl+c.