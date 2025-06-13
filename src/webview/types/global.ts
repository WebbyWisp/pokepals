import type { WebviewMessage } from './pokemon'

// VS Code Webview API types
export interface VSCodeAPI {
  postMessage(message: WebviewMessage): void
  getState(): unknown
  setState(state: unknown): void
}

export interface WindowWithVSCode extends Window {
  acquireVsCodeApi(): VSCodeAPI
}
