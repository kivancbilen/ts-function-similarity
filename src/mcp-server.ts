#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as path from 'path';
import { FunctionExtractor } from './functionExtractor.js';
import { FunctionComparator } from './comparator.js';

const server = new Server(
  {
    name: "ts-function-similarity",
    version: "1.2.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyze_similarity",
        description: "Analyze TypeScript functions from directories or files and find similar functions using Levenshtein distance",
        inputSchema: {
          type: "object",
          properties: {
            paths: {
              type: "array",
              items: { type: "string" },
              description: "Array of directory paths or file paths to analyze",
            },
            minSimilarity: {
              type: "number",
              description: "Minimum similarity score to display (0-100, default: 50)",
              default: 50,
            },
            minLines: {
              type: "number",
              description: "Minimum number of lines for functions to compare (default: 0)",
              default: 0,
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default: 20)",
              default: 20,
            },
            duplicatesOnly: {
              type: "boolean",
              description: "Only show potential duplicates (similarity >= 90%)",
              default: false,
            },
          },
          required: ["paths"],
        },
      },
      {
        name: "find_duplicates",
        description: "Find duplicate or near-duplicate functions (90%+ similarity) in TypeScript code",
        inputSchema: {
          type: "object",
          properties: {
            paths: {
              type: "array",
              items: { type: "string" },
              description: "Array of directory paths or file paths to analyze",
            },
            minLines: {
              type: "number",
              description: "Minimum number of lines for functions to compare (default: 10)",
              default: 10,
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default: 20)",
              default: 20,
            },
          },
          required: ["paths"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "analyze_similarity") {
      const {
        paths = ['.'],
        minSimilarity = 50,
        minLines = 0,
        limit = 20,
        duplicatesOnly = false,
      } = args as any;

      const extractor = new FunctionExtractor();
      let allFunctions = [];

      for (const directory of paths) {
        const targetDir = path.resolve(directory);
        const functions = await extractor.extractFromDirectory(targetDir);
        allFunctions.push(...functions);
      }

      if (allFunctions.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No TypeScript functions found in the specified paths.",
            },
          ],
        };
      }

      const comparator = new FunctionComparator();
      const results = comparator.compareAll(allFunctions, {
        minSimilarity: duplicatesOnly ? 90 : minSimilarity,
        minLines,
        normalize: true,
        excludeSelf: true,
      });

      const displayedResults = results.slice(0, limit);

      let output = `Found ${results.length} similar function pairs\n`;
      output += `Total functions analyzed: ${allFunctions.length}\n\n`;

      displayedResults.forEach((result, index) => {
        output += `${index + 1}. Similarity: ${result.normalizedScore.toFixed(2)}% (Raw: ${result.similarityScore.toFixed(2)}%)\n`;
        output += `   Function 1: ${result.function1.name} (${result.lines1} lines)\n`;
        output += `   Location:   ${result.function1.filePath}:${result.function1.startLine}-${result.function1.endLine}\n`;
        output += `   Function 2: ${result.function2.name} (${result.lines2} lines)\n`;
        output += `   Location:   ${result.function2.filePath}:${result.function2.startLine}-${result.function2.endLine}\n\n`;
      });

      if (results.length > limit) {
        output += `... and ${results.length - limit} more results\n`;
      }

      return {
        content: [
          {
            type: "text",
            text: output,
          },
        ],
      };
    } else if (name === "find_duplicates") {
      const { paths = ['.'], minLines = 10, limit = 20 } = args as any;

      const extractor = new FunctionExtractor();
      let allFunctions = [];

      for (const directory of paths) {
        const targetDir = path.resolve(directory);
        const functions = await extractor.extractFromDirectory(targetDir);
        allFunctions.push(...functions);
      }

      if (allFunctions.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No TypeScript functions found in the specified paths.",
            },
          ],
        };
      }

      const comparator = new FunctionComparator();
      const results = comparator.compareAll(allFunctions, {
        minSimilarity: 90,
        minLines,
        normalize: true,
        excludeSelf: true,
      });

      const displayedResults = results.slice(0, limit);

      let output = `Found ${results.length} duplicate/near-duplicate function pairs\n`;
      output += `Total functions analyzed: ${allFunctions.length}\n`;
      output += `Filter: Functions with ${minLines}+ lines\n\n`;

      displayedResults.forEach((result, index) => {
        output += `${index + 1}. Similarity: ${result.normalizedScore.toFixed(2)}% (Raw: ${result.similarityScore.toFixed(2)}%)\n`;
        output += `   Function 1: ${result.function1.name} (${result.lines1} lines)\n`;
        output += `   Location:   ${result.function1.filePath}:${result.function1.startLine}-${result.function1.endLine}\n`;
        output += `   Function 2: ${result.function2.name} (${result.lines2} lines)\n`;
        output += `   Location:   ${result.function2.filePath}:${result.function2.startLine}-${result.function2.endLine}\n\n`;
      });

      if (results.length > limit) {
        output += `... and ${results.length - limit} more results\n`;
      }

      return {
        content: [
          {
            type: "text",
            text: output,
          },
        ],
      };
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TS Function Similarity MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
