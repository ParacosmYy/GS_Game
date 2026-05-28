import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup/audioCtxMock.ts'],
    exclude: ['references/**', 'node_modules/**', 'dist/**'],
  },
});
