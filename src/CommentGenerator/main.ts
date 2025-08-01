
import * as vscode from 'vscode';
import { PythonCommentGenerator } from './python';

export class AddCommentsManager {
    private pythonGenerator: PythonCommentGenerator;

    constructor() {
        this.pythonGenerator = new PythonCommentGenerator();
    }

    async addComments(editor: vscode.TextEditor): Promise<void> {
        const document = editor.document;
        
        if (document.languageId === 'python') {
            await this.pythonGenerator.addCommentsSequentially(editor);
        } else {
            throw new Error(`Unsupported language: ${document.languageId}`);
        }
    }
}
export function commentGenerator(context: vscode.ExtensionContext) {
    console.log('Below C Level extension is now active!');

    const addCommentsManager = new AddCommentsManager();

    // Register the command for adding philosophical comments
    let disposable = vscode.commands.registerCommand('below-c-level.generateComment', async () => {
        const editor = vscode.window.activeTextEditor;
        
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found!');
            return;
        }

        const document = editor.document;
        if (document.languageId !== 'python') {
            vscode.window.showErrorMessage('This command only works with Python files!');
            return;
        }

        vscode.window.showInformationMessage('Adding philosophical chaos to your code...');
        
        try {
            await addCommentsManager.addComments(editor);
            vscode.window.showInformationMessage('Successfully added philosophical comments! Your code is now 10x more enlightened and 100x more useless!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to add comments: ${error}`);
        }
    });

    context.subscriptions.push(disposable);
}

