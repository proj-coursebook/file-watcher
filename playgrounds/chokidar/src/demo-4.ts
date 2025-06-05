import { watch, type ChokidarOptions } from "chokidar";
import micromatch from "micromatch"; 

const paths = ["./source-1", "./source-2", "./source-3"];

// Using micromatch + any of the following patterns should work
// const exclude = "**/*.log";
// const exclude = ["**/*.log", "**/*.tmp"];
const exclude = ["**/*.{tmp,log}"];

const chokidarOptions: ChokidarOptions = {
  ignored: (path) => micromatch.isMatch(path, exclude), // This works!
  persistent: true,
};

const watcher = watch(paths, chokidarOptions);

watcher
  .on("all", async (event, path) => {
    console.log("All event:", event, path);
  });

// Run this script with npm run demo-4,
// then uncomment the options for the `exclude` variable and see what happens.
// Stop the script with ctrl+c.