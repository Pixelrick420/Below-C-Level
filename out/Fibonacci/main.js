"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFibonacci = addFibonacci;
exports.addToggleAutoFibonacci = addToggleAutoFibonacci;
const vscode = __importStar(require("vscode"));
function fibonacci(n) {
    if (n <= 1)
        return 1;
    let a = 1, b = 2;
    for (let i = 2; i <= n; i++) {
        const temp = a + b;
        a = b;
        b = temp;
    }
    return a;
}
function getIndentLevel(line) {
    // Count leading whitespace
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
}
function isBlockStart(line) {
    const trimmed = line.trim();
    // Check for statements that start new blocks
    return /^(for\s|if\s|while\s|def\s|class\s|with\s|try:|except|finally:|else:|elif\s)/.test(trimmed) ||
        trimmed.endsWith(':');
}
function applyFibonacciIndent(doc, editor) {
    const edits = [];
    const lineCount = doc.lineCount;
    // Track nesting levels based on actual code structure
    const nestingStack = [0]; // Start with base level
    for (let i = 0; i < lineCount; i++) {
        const line = doc.lineAt(i);
        const text = line.text;
        const trimmed = text.trim();
        // Skip empty lines
        if (trimmed === "")
            continue;
        const currentIndent = getIndentLevel(text);
        // Determine nesting level based on indentation changes
        if (i > 0) {
            const prevLine = doc.lineAt(i - 1);
            const prevTrimmed = prevLine.text.trim();
            const prevIndent = getIndentLevel(prevLine.text);
            // If previous line starts a block, increase nesting
            if (isBlockStart(prevTrimmed)) {
                const newLevel = nestingStack[nestingStack.length - 1] + 1;
                nestingStack.push(newLevel);
            }
            // If current line has less indentation, pop from stack
            else if (currentIndent < prevIndent) {
                // Pop levels until we match the current indentation pattern
                while (nestingStack.length > 1 && currentIndent <= prevIndent) {
                    nestingStack.pop();
                    if (nestingStack.length > 0) {
                        const stackLevel = nestingStack[nestingStack.length - 1];
                        if (currentIndent >= stackLevel)
                            break;
                    }
                }
            }
        }
        // Get current nesting level (0-based, so add 1 for Fibonacci)
        const nestingLevel = nestingStack.length;
        // Calculate Fibonacci indentation
        let fibIndent = fibonacci(nestingLevel);
        // Safety check
        if (!Number.isFinite(fibIndent) || fibIndent > 1000) {
            fibIndent = 1000; // cap spaces
        }
        // Create new line with Fibonacci spacing
        const spaces = " ".repeat(fibIndent * 4 - 4); // Use spaces instead of tabs
        const newLine = spaces + trimmed;
        // Only apply edit if line actually changes
        if (newLine !== text) {
            edits.push(vscode.TextEdit.replace(line.range, newLine));
        }
    }
    // Apply all edits at once
    if (edits.length > 0) {
        const wsEdit = new vscode.WorkspaceEdit();
        wsEdit.set(doc.uri, edits);
        vscode.workspace.applyEdit(wsEdit);
    }
}
function addFibonacci(context) {
    // Register manual command
    context.subscriptions.push(vscode.commands.registerCommand('below-c-level.fibonacciIndent', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        applyFibonacciIndent(editor.document, editor);
    }));
    // Auto-apply on save with delay
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(doc => {
        const config = vscode.workspace.getConfiguration('belowCLevel');
        const autoEnabled = config.get('autoFibonacci', false);
        if (autoEnabled) {
            const delay = config.get('fibonacciDelay', 5000);
            setTimeout(() => {
                const editor = vscode.window.activeTextEditor;
                if (editor && editor.document === doc) {
                    applyFibonacciIndent(doc, editor);
                }
            }, delay);
        }
    }));
}
// Additional utility function to toggle auto-fibonacci
function addToggleAutoFibonacci(context) {
    context.subscriptions.push(vscode.commands.registerCommand('below-c-level.toggleAutoFibonacci', async () => {
        const config = vscode.workspace.getConfiguration('belowCLevel');
        const current = config.get('autoFibonacci', false);
        await config.update('autoFibonacci', !current, vscode.ConfigurationTarget.Workspace);
        vscode.window.showInformationMessage(`Auto Fibonacci Indent: ${!current ? 'Enabled' : 'Disabled'}`);
    }));
}
//# sourceMappingURL=main.js.map