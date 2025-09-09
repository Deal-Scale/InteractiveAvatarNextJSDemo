# MCP Server Testing Guide

## Environment Setup
```bash
# Required environment variables
cp .env.example .env
# Edit with your credentials
nano .env
```

## Running Tests
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test tests/mcpConnection.test.ts

# Run with coverage
pnpm test --coverage
```

## Test Structure
- `tests/example.test.ts`: Basic test examples
- `tests/mcpConnection.test.ts`: MCP server integration tests

## Writing New Tests
1. Create new `.test.ts` files in `/tests`
2. Follow existing patterns for:
   - MCP server tests
   - Component tests
3. Use `describe`/`it` blocks
4. Include proper cleanup in `afterEach`/`afterAll`

## Debugging Tips
- Set `DEBUG=true` for verbose output
- Check test timeouts (default 10s)
- Review coverage reports in `/coverage`
