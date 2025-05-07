import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FileWatcherImpl } from "../src";

describe('FileWatcherImpl', () => {
  let fileWatcher: FileWatcherImpl;

  beforeEach(() => {
    fileWatcher = new FileWatcherImpl({ source: './test' });
  });

  it('should be a function', () => {
    expect(FileWatcherImpl).toBeInstanceOf(Function);
  });
});