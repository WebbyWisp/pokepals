/**
 * VS Code mock for Vitest
 * This file provides a comprehensive mock of the VS Code API using jest-mock-vscode
 */

import { createVSCodeMock } from 'jest-mock-vscode'
import { vi } from 'vitest'

// Create the VS Code mock using the professional library
const vscode = createVSCodeMock(vi)

export = vscode
