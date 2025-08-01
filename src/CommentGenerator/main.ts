import * as vscode from 'vscode';
import { PythonCommentGenerator } from './python';

export class AddCommentsManager {
    private pythonGenerator: PythonCommentGenerator;

    constructor() {
        this.pythonGenerator = new PythonCommentGenerator();
    }

    async addComments(editor: vscode.TextEditor, apiKey: string): Promise<void> {
        const document = editor.document;
        
        if (document.languageId === 'python') {
            await this.pythonGenerator.addPhilosophicalComments(editor, apiKey);
        } else {
            throw new Error(`Unsupported language: ${document.languageId}`);
        }
    }
}
export function commentGenerator(context: vscode.ExtensionContext) {
    console.log('Below C Level extension is now active!');

    const addCommentsManager = new AddCommentsManager();

    // Register the command for adding philosophical comments
    let disposable = vscode.commands.registerCommand('below-c-level.addPhilosophicalComments', async () => {
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

        // Check if API key is configured
        const config = vscode.workspace.getConfiguration('below-c-level');
        const apiKey = config.get<string>('groqApiKey');
        
        if (!apiKey) {
            const result = await vscode.window.showInputBox({
                prompt: 'Enter your Groq API Key',
                password: true,
                placeHolder: 'gsk_...'
            });
            
            if (result) {
                await config.update('groqApiKey', result, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage('API key saved! Run the command again.');
                return;
            } else {
                vscode.window.showErrorMessage('API key is required!');
                return;
            }
        }

        vscode.window.showInformationMessage('Adding philosophical chaos to your code...');
        
        try {
            await addCommentsManager.addComments(editor, apiKey);
            vscode.window.showInformationMessage('Successfully added philosophical comments! Your code is now 10x more enlightened and 100x more useless!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to add comments: ${error}`);
        }
    });

    // Register command to clear API key
    let clearKeyDisposable = vscode.commands.registerCommand('below-c-level.clearApiKey', async () => {
        const config = vscode.workspace.getConfiguration('below-c-level');
        await config.update('groqApiKey', undefined, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('API key cleared!');
    });

    context.subscriptions.push(disposable, clearKeyDisposable);
}