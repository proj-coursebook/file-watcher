# File Watcher

A minimal, type-safe file watcher for JavaScript/TypeScript. Use it to watch directories or files for changes and perform actions when changes are detected. It is a thin wrapper around [chokidar](https://github.com/paulmillr/chokidar) with a type-safe, minimal API and improved logging.

## Features

- Watch files or directories for changes (add, change, unlink, etc.)
- Exclude files or directories using glob patterns
- TypeScript type definitions
- Detailed logging with adjustable log level
- Minimal dependencies
- Can be used locally or published to NPM

## Usage

### Basic Example

```typescript
import { FileWatcherImpl, type FileWatcher } from "@coursebook/file-watcher";

const fileWatcher: FileWatcher = new FileWatcherImpl({
  source: "./source-folder",
  // Exclude any file that includes "tmp" in the name
  exclude: ["**/*tmp*"],
});

fileWatcher.setLogLevel("info"); // set to "trace" to see more detailed logs

fileWatcher.watch(async (path) => {
  // Do something with the file
  console.log(`File changed: ${path}`);
});
```

- Run your script, then create/update/delete files in the `./source-folder` directory to see the output.
- Stop the script with ctrl+c.

## API

### WatchOptions

```typescript
interface WatchOptions {
  /** Source directory to watch */
  source: string | string[];
  /** Patterns to ignore, relative to source directory */
  exclude?: string | string[];
  /** Whether to use polling instead of native watchers */
  usePolling?: boolean;
}
```

### FileWatcher Interface

```typescript
interface FileWatcher {
  /**
   * Start watching files/directories
   * @param onChange - The function to call when a file changes
   */
  watch(onChange: (path: string) => Promise<void>): void;

  /**
   * Set the log level for the file watcher
   * @param level - The log level to set ("trace" | "debug" | "info" | "error")
   */
  setLogLevel(level: LogLevel): void;
}
```

### Error Handling

The component uses custom error types for better error handling:

```typescript
enum FileWatcherErrorType {
  WATCH_ERROR = "WATCH_ERROR",
  CONFIG_ERROR = "CONFIG_ERROR",
}

class FileWatcherError extends Error {
  constructor(
    public type: FileWatcherErrorType,
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "FileWatcherError";
  }
}
```

## Logging

The file watcher uses the LogManager for detailed operation logging:

- `trace`: Detailed operation steps
- `debug`: Operation details
- `info`: Operation summaries
- `error`: Operation failures

Set the log level using `setLogLevel("trace" | "debug" | "info" | "error")`.

# Change Tracker

A minimal, type-safe change tracker for JavaScript/TypeScript. You can use it to track changes to files for example. But it can be used for other things as well, as long as you can represent the data as a collection of types with a `contents: Buffer` property.

## Features

- Tracks file changes between builds using MD5 hashes
- Stores change history in a JSON file
- Detects new, modified, unchanged, and untracked files
- Handles deleted files by cleaning up their history
- Provides detailed logging of change tracking operations
- Supports clearing change history

## Usage

> **Note:** The type parameter for `ChangeTrackerImpl` and `FileDataCollection` must extend `{ contents: Buffer }`.

### Basic Usage

```typescript
import {
  ChangeTrackerImpl,
  type FileDataCollection,
} from "@coursebook/change-tracker";

// Define a type for test file data
type TestFileData = { contents: Buffer };

// Create change tracker instance
const changeTracker = new ChangeTrackerImpl<TestFileData>({
  historyPath: "./example-history.json",
});

// Track changes in files
// You can change the files object to simulate changes and rerun this script
const files: FileDataCollection<TestFileData> = {
  "example.txt": {
    contents: Buffer.from("file content!"),
  },
};

const states = await changeTracker.trackChanges(files);

// Get state of a specific file
const state = changeTracker.getFileState("example.txt");
console.log(state?.status); // 'new', 'modified', 'unchanged', or 'untracked'
```

### Build Pipeline Example

```typescript
import {
  ChangeTrackerImpl,
  type FileDataCollection,
} from "@coursebook/change-tracker";

// Define a type for file data
type FileData = { contents: Buffer };

// Initialize components
const changeTracker = new ChangeTrackerImpl<FileData>({
  historyPath: '.content-smith/history.json',
});

// During build
async function build() {
  // Read files
  const files: FileDataCollection<FileData> = await readFiles();

  // Track changes
  const states = await changeTracker.trackChanges(files);

  // Use change states
  for (const [filepath, state] of states) {
    if (state.status !== 'unchanged') {
      // Process changed files
      await processFile(files[filepath]);
    }
  }
}
```

## API

### HasContents and FileDataCollection

```typescript
interface HasContents {
  contents: Buffer;
}

type FileDataCollection<T extends HasContents> = Record<string, T>;
```

### ChangeTracker Interface

```typescript
interface ChangeTracker<T extends HasContents> {
  trackChanges(files: FileDataCollection<T>): Promise<FileStates>;
  getFileState(filepath: string): FileChangeState | undefined;
  clearHistory(): Promise<void>;
  enable(options: boolean | ChangeTrackerConfig): void;
}
```

### Configuration

```typescript
interface ChangeTrackerConfig {
  historyPath: string;  // Path to store change history
  enabled?: boolean;    // Enable/disable change tracking (default: true)
}
```

### File Change Status and State

```typescript
type FileChangeStatus = 'new' | 'modified' | 'unchanged' | 'untracked';

interface FileChangeState {
  status: FileChangeStatus;
  previousFingerprint?: string;
}
```

## How It Works

1. Loading History
   - Loads previous file fingerprints from the history file
   - If no history exists, starts fresh

2. Tracking Changes
   - Calculates MD5 hash for each file's contents
   - Compares with previous hashes to determine changes
   - Marks files as:
     - "new" if no previous hash exists
     - "modified" if hash has changed
     - "unchanged" if hash remains the same
     - "untracked" if tracking is disabled
   - Removes tracking for deleted files

3. Saving History
   - Saves current fingerprints to history file
   - Creates necessary directories if they don't exist
   - Uses pretty JSON format for readability

## Error Handling

The component uses custom error types for better error handling:

```typescript
enum ChangeTrackerErrorType {
  HISTORY_PATH_NOT_SET = 'HISTORY_PATH_NOT_SET',
  HISTORY_READ_ERROR = 'HISTORY_READ_ERROR',
  HISTORY_WRITE_ERROR = 'HISTORY_WRITE_ERROR',
}
```

## Logging

The component uses the LogManager for detailed operation logging:

- `trace`: Detailed operation steps
- `debug`: Operation details and file states
- `info`: Operation summaries
- `error`: Operation failures

## Best Practices

1. **History File Location**
   - Store in a consistent location
   - Use `.gitignore` to exclude history file
   - Consider environment-specific paths

2. **Error Handling**
   - Always handle potential errors
   - Provide fallback behavior
   - Use the provided error types

3. **Performance**
   - Consider file size when calculating hashes
   - Clear history periodically if needed
   - Handle large numbers of files efficiently

## Installation

### Installing from NPM (After Publishing)

Once published to NPM, the package can be installed using:

```bash
npm install @coursebook/file-watcher
```

This template is particularly useful for creating packages that are intended to be used locally so read the instructions below for local development.

### Local Development (Without Publishing to NPM)

There are three ways to use this package locally:

#### Option 1: Using npm link

1. Clone this repository, install dependencies, build the package, and create a global symlink:

   ```bash
   git clone <repository-url>
   cd file-watcher/packages/file-watcher
   # Install dependencies and build the package
   npm install
   npm run build
   # Create a global symlink
   npm link
   ```

   Note: You can unlink the package later using `npm unlink`.

2. In your other project where you want to use this package:

   ```bash
   npm link @coursebook/file-watcher
   ```

3. Import the package in your project:

   ```typescript
   import { FileWatcherImpl, type FileWatcher } from '@coursebook/file-watcher';
   ```

#### Option 2: Using local path

In your other project's `package.json`, add this package as a dependency using the local path:

```json
{
  "dependencies": {
    "@coursebook/file-watcher": "file:/path/to/file-watcher"
  }
}
```

You can use absolute or relative paths with the `file:` protocol.

Then run `npm install` in your project.

Now you can import the package in your project as usual.

#### Option 3: Using a local tarball (npm pack)

1. Follow option 1 but instead of using `npm link`, create a tarball of the package:

   ```bash
   npm pack
   ```

   This will generate a file like `coursebook-file-watcher-1.0.0.tgz`. (Or whatever version you have.)
   You can find the tarball in the same directory as your `package.json`.

2. In your other project, install the tarball:

   ```bash
   npm install /absolute/path/to/file-watcher/coursebook-file-watcher-1.0.0.tgz
   ```

   Or, if you copy the tarball into your project directory:

   ```bash
   npm install ./coursebook-file-watcher-1.0.0.tgz
   ```

This method installs the package exactly as it would be published to npm, making it ideal for final testing. After this installation, you must have the package in your `node_modules` directory, and you can import it as usual. You will also see the package in your `package.json` file as a dependency:

```json
{
  "dependencies": {
    "@coursebook/file-watcher": "file:coursebook-file-watcher-1.0.0.tgz"
  }
}
```