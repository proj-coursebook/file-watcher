import { watch, type ChokidarOptions } from "chokidar";

const paths = "./source-1";

// [!IMPORTANT]
// Any of the following patterns should work but they don't (at least not on my MacOS)
const exclude = "./source-1/example.log";
// const exclude = "example.log";
// const exclude = "**/*.log";
// const exclude = ["**/*.log", "**/*.tmp"];
// const exclude = ["*.{tmp,log}"];

const chokidarOptions: ChokidarOptions = {
  ignored: exclude, // NOT WORKING!
  persistent: true,
};

const watcher = watch(paths, chokidarOptions);

watcher
  .on("all", async (event, path) => {
    console.log("All event:", event, path);
  });

// Run this script with npm run demo-3,
// then uncomment the options for the `exclude` variable and see what happens.
// Stop the script with ctrl+c.