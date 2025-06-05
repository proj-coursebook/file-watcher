import { watch, type ChokidarOptions } from "chokidar";

const paths = "./source-1/";

const chokidarOptions: ChokidarOptions = {
  persistent: true,
};

const watcher = watch(paths, chokidarOptions);

watcher
  // .on("ready", () => console.log("Initial scan complete. Ready for changes"))
  // .on("addDir", (path, stats) => console.log(`Directory ${path} has been added`))
  // .on("add", (path, stats) => console.log(`File ${path} has been added`))
  // .on("change", (path, stats) => console.log(`File ${path} changed size to ${stats.size}`))
  // .on("unlink", (path) => console.log(`File ${path} has been removed`))
  // .on("unlinkDir", (path) => console.log(`Directory ${path} has been removed`))
  // .on("error", (error) => console.log(`Watcher error: ${error}`))
  // .on("raw", (event, path, details) => {
  //   console.log("Raw event info:", event, path, details);
  // })
  .on("all", async (event, path) => {
    console.log("All event:", event, path);
  });

// Run this script with npm run demo-1,
// then create/update/delete files in the ./source-1 directory to see the output.
// Stop the script with ctrl+c.