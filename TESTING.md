# Testing Guide for Pokémon Pals VS Code Extension

This guide explains how to write and run tests for the Pokémon Pals VS Code extension using Vitest and jest-mock-vscode.

## Setup

The project uses **Vitest** as the testing framework with **jest-mock-vscode** for mocking VS Code APIs.

### Key Dependencies

- `vitest` - Modern, fast testing framework
- `jest-mock-vscode` - Professional VS Code API mocking library

### Configuration Files

- `vitest.config.ts` - Main Vitest configuration
- `__mocks__/vscode.ts` - VS Code API mock using jest-mock-vscode
- `src/test/setup.ts` - Test environment setup

## Running Tests

### Available Commands

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests in watch mode (explicit)
npm run test:watch
```

### VS Code Integration

You can also run tests from VS Code using the "Run Vitest" debug configuration in `.vscode/launch.json`.

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { Pokemon, type PokemonSpecies } from '../models/Pokemon'

describe('Pokemon Model Tests', () => {
  let testSpecies: PokemonSpecies

  beforeEach(() => {
    testSpecies = {
      id: 25,
      name: 'Pikachu',
      types: ['Electric'],
      rarity: 'common',
      baseStats: {
        hp: 35,
        attack: 55,
        defense: 40,
        specialAttack: 50,
        specialDefense: 50,
        speed: 90
      },
      biomes: ['forest', 'city'],
      spriteUrl: 'pikachu.png'
    }
  })

  it('should create a new Pokemon with correct initial values', () => {
    const pokemon = new Pokemon(testSpecies, 'Sparky')

    expect(pokemon.nickname).toBe('Sparky')
    expect(pokemon.stats.level).toBe(1)
    expect(pokemon.id).toBeDefined()
  })
})
```

### Testing VS Code Extension Functionality

The project uses `jest-mock-vscode` to provide comprehensive VS Code API mocking:

```typescript
import { describe, it, expect, vi } from 'vitest'
import * as vscode from 'vscode' // Automatically uses jest-mock-vscode

describe('VS Code Integration Tests', () => {
  it('should handle VS Code API calls gracefully', async () => {
    // Import vscode - this will automatically use our mock
    const vscode = await import('vscode')

    expect(vscode).toBeDefined()
    expect(vscode.commands).toBeDefined()
    expect(vscode.window).toBeDefined()
    expect(vscode.workspace).toBeDefined()

    // Test that we can call VS Code API methods
    expect(typeof vscode.commands.registerCommand).toBe('function')
    expect(typeof vscode.window.showInformationMessage).toBe('function')
  })

  it('should mock VS Code APIs properly', async () => {
    // Mock showInformationMessage to return a specific value
    vi.mocked(vscode.window.showInformationMessage).mockResolvedValue('OK')

    const result = await vscode.window.showInformationMessage('Test message')

    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Test message')
    expect(result).toBe('OK')
  })
})
```

### Best Practices

#### 1. Test Organization

- Use `describe` blocks to group related tests
- Use clear, descriptive test names
- Keep tests focused and isolated

#### 2. Mock Management

- Use `beforeEach` to reset mocks: `vi.clearAllMocks()`
- Use `vi.mocked()` to access mock functions with type safety
- Leverage the professional jest-mock-vscode library instead of custom mocks

#### 3. Test Isolation

- Each test should be independent
- Don't rely on test execution order
- Clean up after tests when necessary

#### 4. Type Safety

- Import types properly: `import { type PokemonSpecies } from '../models/Pokemon'`
- Use TypeScript throughout your tests
- Leverage the type safety provided by jest-mock-vscode

## Project-Specific Testing

### Pokemon Models

Test core game logic like:

- Pokemon creation and initialization
- Experience gain and leveling
- Mood updates based on happiness
- Serialization/deserialization

### Game State Management

Test game state operations:

- Save and load functionality
- Settings management
- Player statistics tracking

### VS Code Extension Features

Test extension-specific functionality:

- Command registration and execution
- Configuration management
- Status bar updates
- Webview interactions

## Coverage

Generate test coverage reports:

```bash
# Run tests with coverage
npx vitest run --coverage
```

Coverage reports help identify untested code paths and ensure comprehensive test coverage.

## Debugging Tests

### VS Code Debugging

1. Set breakpoints in your test files
2. Use the "Run Vitest" debug configuration
3. Step through test execution

### Console Debugging

- Use `console.log()` in tests (suppressed by default unless `VITEST_VERBOSE=true`)
- Check test output for detailed error messages
- Use `--reporter=verbose` for detailed test results

## Troubleshooting

### Common Issues

**Tests not finding VS Code mock:**

- Ensure `__mocks__/vscode.ts` exists
- Check `vitest.config.ts` has the correct alias configuration

**Type errors with VS Code APIs:**

- Make sure `@types/vscode` is installed
- Use `vi.mocked()` for type-safe mock access

**Mock not working as expected:**

- Use `vi.clearAllMocks()` in `beforeEach`
- Check that you're importing vscode correctly
- Verify jest-mock-vscode is properly configured

### Getting Help

- Check the [jest-mock-vscode documentation](https://github.com/streetsidesoftware/jest-mock-vscode)
- Review the [Vitest documentation](https://vitest.dev/)
- Look at existing test examples in `src/test/`

## Example Test Files

- `src/test/example.test.ts` - Basic Pokemon model tests and VS Code integration
- `src/test/setup.ts` - Test environment configuration

These files serve as templates for writing new tests in the project.
