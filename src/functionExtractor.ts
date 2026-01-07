import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@typescript-eslint/typescript-estree';
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import { normalizeCode } from './levenshtein.js';

export interface ExtractedFunction {
  name: string;
  code: string;
  normalizedCode: string;  // Phase 1.4: Pre-normalized code cached at extraction
  filePath: string;
  startLine: number;
  endLine: number;
}

export class FunctionExtractor {
  private functions: ExtractedFunction[] = [];

  /**
   * Recursively scan directory or process single file for TypeScript files
   */
  public async extractFromDirectory(dirPath: string): Promise<ExtractedFunction[]> {
    this.functions = [];

    // Check if it's a file or directory
    const stats = fs.statSync(dirPath);
    if (stats.isFile()) {
      if (this.isTypeScriptFile(dirPath)) {
        await this.extractFunctionsFromFile(dirPath);
      }
    } else if (stats.isDirectory()) {
      await this.scanDirectory(dirPath);
    }

    return this.functions;
  }

  private async scanDirectory(dirPath: string): Promise<void> {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
          continue;
        }
        await this.scanDirectory(fullPath);
      } else if (entry.isFile() && this.isTypeScriptFile(entry.name)) {
        await this.extractFunctionsFromFile(fullPath);
      }
    }
  }

  private isTypeScriptFile(filename: string): boolean {
    return filename.endsWith('.ts') || filename.endsWith('.tsx');
  }

  private async extractFunctionsFromFile(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const ast = parse(content, {
        loc: true,
        range: true,
        comment: false,
      });

      this.traverseAST(ast, content, filePath);
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
    }
  }

  private traverseAST(node: any, content: string, filePath: string): void {
    if (!node || typeof node !== 'object') {
      return;
    }

    // Check if node is a function
    if (this.isFunctionNode(node)) {
      const functionInfo = this.extractFunctionInfo(node, content, filePath);
      if (functionInfo) {
        this.functions.push(functionInfo);
      }
    }

    // Traverse child nodes
    for (const key in node) {
      if (key === 'parent' || key === 'loc' || key === 'range') {
        continue;
      }

      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach((item) => this.traverseAST(item, content, filePath));
      } else if (typeof child === 'object' && child !== null) {
        this.traverseAST(child, content, filePath);
      }
    }
  }

  private isFunctionNode(node: any): boolean {
    return (
      node.type === AST_NODE_TYPES.FunctionDeclaration ||
      node.type === AST_NODE_TYPES.FunctionExpression ||
      node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
      node.type === AST_NODE_TYPES.MethodDefinition
    );
  }

  private extractFunctionInfo(
    node: any,
    content: string,
    filePath: string
  ): ExtractedFunction | null {
    if (!node.loc) {
      return null;
    }

    const startLine = node.loc.start.line;
    const endLine = node.loc.end.line;
    const startOffset = node.range[0];
    const endOffset = node.range[1];

    // Extract function code
    const code = content.substring(startOffset, endOffset);

    // Get function name
    let name = 'anonymous';
    if (node.type === AST_NODE_TYPES.FunctionDeclaration && node.id) {
      name = node.id.name;
    } else if (node.type === AST_NODE_TYPES.MethodDefinition && node.key) {
      name = node.key.name || node.key.value;
    } else if (node.type === AST_NODE_TYPES.FunctionExpression && node.id) {
      name = node.id.name;
    }

    return {
      name,
      code,
      normalizedCode: normalizeCode(code),  // Phase 1.4: Normalize once at extraction
      filePath,
      startLine,
      endLine,
    };
  }
}
