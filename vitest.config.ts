import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', '.vscode-test'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '.vscode-test/', 'src/**/*.d.ts', 'coverage/**', 'vitest.config.ts']
    },
    // VS Code extension specific setup
    setupFiles: ['./src/test/setup.ts']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Mock vscode module for all tests
      vscode: path.resolve(__dirname, '__mocks__/vscode.ts')
    }
  },
  define: {
    // Define VS Code extension globals if needed
    PRODUCTION: false
  }
})
