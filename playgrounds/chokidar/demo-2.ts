import { watch, type ChokidarOptions } from "chokidar";

// These path patterns work
const paths = "./source-1/";
// const paths = ["./source-1/"];
// const paths = ["./source-1/", "./source-2/"];
// const paths = ["./source-1/", "./source-2/", "./source-3/"];

// [!IMPORTANT]
// Glob patters are supposed to work but they don't (at least not on my MacOS)
// const paths = "./source-1/**.*";

const chokidarOptions: ChokidarOptions = {
  persistent: true,
};

const watcher = watch(paths, chokidarOptions);

watcher
  .on("all", async (event, path) => {
    console.log("All event:", event, path);
  });

// Run this script with npm run demo-2,
// then uncomment the options for the `paths` variable and see what happens.
// Stop the script with ctrl+c.