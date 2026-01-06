# MCP Server for TypeScript Function Similarity

This package includes an MCP (Model Context Protocol) server that allows AI assistants like Claude to analyze TypeScript code for function similarity.

## What is MCP?

Model Context Protocol (MCP) is a standard protocol that allows AI assistants to interact with external tools and data sources. This MCP server exposes the TypeScript function similarity analyzer as tools that can be used by AI assistants.

## Installation

After publishing to npm, install the package globally:

```bash
npm install -g ts-function-similarity
```

Or install locally in your project:

```bash
npm install ts-function-similarity
```

## Configuration

### For Claude Desktop

Add the following to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ts-function-similarity": {
      "command": "ts-similarity-mcp"
    }
  }
}
```

If you installed locally instead of globally, use the full path:

```json
{
  "mcpServers": {
    "ts-function-similarity": {
      "command": "npx",
      "args": ["-y", "ts-similarity-mcp"]
    }
  }
}
```

### For Other MCP Clients

The MCP server runs on stdio. You can start it with:

```bash
ts-similarity-mcp
```

Or if installed locally:

```bash
npx ts-similarity-mcp
```

## Available Tools

### analyze_similarity

Analyze TypeScript functions and find similar functions using Levenshtein distance.

**Parameters:**
- `paths` (required): Array of directory paths or file paths to analyze
- `minSimilarity` (optional): Minimum similarity score to display (0-100, default: 50)
- `minLines` (optional): Minimum number of lines for functions to compare (default: 0)
- `limit` (optional): Maximum number of results to return (default: 20)
- `duplicatesOnly` (optional): Only show potential duplicates with similarity >= 90% (default: false)

**Example usage in Claude:**
```
Can you analyze the TypeScript files in ./src for similar functions with at least 70% similarity?
```

### find_duplicates

Find duplicate or near-duplicate functions (90%+ similarity) in TypeScript code.

**Parameters:**
- `paths` (required): Array of directory paths or file paths to analyze
- `minLines` (optional): Minimum number of lines for functions to compare (default: 10)
- `limit` (optional): Maximum number of results to return (default: 20)

**Example usage in Claude:**
```
Can you find duplicate functions in my TypeScript codebase that have at least 15 lines?
```

## Example Conversations with Claude

Once configured, you can ask Claude to:

1. **Find code duplicates:**
   ```
   Find duplicate functions in ./src with at least 90% similarity
   ```

2. **Analyze cross-module similarity:**
   ```
   Compare functions between ./src/components and ./src/services directories
   ```

3. **Focus on substantial functions:**
   ```
   Find similar functions that are at least 20 lines long in my ./lib directory
   ```

4. **Get refactoring suggestions:**
   ```
   Find duplicate functions in ./src and suggest how to refactor them
   ```

## How It Works

The MCP server:
1. Receives requests from the AI assistant (Claude)
2. Extracts TypeScript functions from the specified paths
3. Compares functions using Levenshtein distance
4. Returns similarity results to the AI assistant
5. The AI assistant can then interpret and present the results in a helpful way

## Troubleshooting

### Server not connecting

1. Make sure the package is installed globally or use the `npx` method
2. Check that the configuration file path is correct for your OS
3. Restart Claude Desktop after updating the configuration

### No results found

1. Ensure the paths you're providing contain TypeScript files (.ts or .tsx)
2. Try lowering the `minSimilarity` threshold
3. Check that the paths are relative to the directory where you started the MCP server

### Performance issues

For large codebases:
1. Use `minLines` to filter out small functions
2. Increase `minSimilarity` to reduce comparisons
3. Use `find_duplicates` instead of `analyze_similarity` for focused analysis

## Learn More

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Claude Desktop MCP Setup](https://docs.anthropic.com/claude/docs/model-context-protocol)
- [Main README](./README.md) for CLI usage
