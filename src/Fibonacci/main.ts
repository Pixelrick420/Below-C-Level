import * as vscode from 'vscode';

function fibonacci(n: number): number {
    if (n <= 1) {
        return 1;
    }
    let a = 1, b = 2;
    for (let i = 2; i <= n; i++) {
        const temp = a + b;
        a = b;
        b = temp;
    }
    return a;
}

function getIndentLevel(line: string): number {
    // Count leading whitespace
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
}

function isBlockStart(line: string): boolean {
    const trimmed = line.trim();
    // Check for statements that start new blocks
    return /^(for\s|if\s|while\s|def\s|class\s|with\s|try:|except|finally:|else:|elif\s)/.test(trimmed) || 
           trimmed.endsWith(':');
}

function applyFibonacciIndent(doc: vscode.TextDocument, editor: vscode.TextEditor) {
    const edits: vscode.TextEdit[] = [];
    const lineCount = doc.lineCount;
    
    const nestingStack: number[] = [0]; 
    
    for (let i = 0; i < lineCount; i++) {
        const line = doc.lineAt(i);
        const text = line.text;
        const trimmed = text.trim();
        
        // Skip empty lines
        if (trimmed === ""){
            continue;
        }
        
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
                        if (currentIndent >= stackLevel){
                            break;
                        }
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

export function activateFibonacci(context: vscode.ExtensionContext) {
    // Register manual command
    context.subscriptions.push(
        vscode.commands.registerCommand('below-c-level.fibonacci', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }
            applyFibonacciIndent(editor.document, editor);
        })
    );

    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('belowCLevel.autoFibonacci')) {
                setupAutoFibonacci();
            }
        })
    );

    // Listen for when text documents are opened
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(document => {
            if (shouldAutoApplyFibonacci(document)) {
                // Small delay to ensure the document is fully loaded
                setTimeout(() => {
                    const editor = vscode.window.visibleTextEditors.find(e => e.document === document);
                    if (editor) {
                        applyFibonacciIndent(document, editor);
                    }
                }, 100);
            }
        })
    );

    // Listen for when the active editor changes
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && shouldAutoApplyFibonacci(editor.document)) {
                setTimeout(() => {
                    applyFibonacciIndent(editor.document, editor);
                }, 100);
            }
        })
    );

    setupAutoFibonacci();
}

function setupAutoFibonacci() {
    // This function can be used for any future auto-fibonacci setup if needed
    // For now, the auto functionality is handled by the document event listeners
}

function shouldAutoApplyFibonacci(document: vscode.TextDocument): boolean {
    const config = vscode.workspace.getConfiguration('belowCLevel');
    const autoFibonacci = config.get<boolean>('autoFibonacci', false);
    
    // Only apply to Python files and only if auto mode is enabled
    return autoFibonacci && document.languageId === 'python';
}