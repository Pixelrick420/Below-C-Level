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
exports.commentGenerator = commentGenerator;
const vscode = __importStar(require("vscode"));
const python_1 = require("./python");
class AddCommentsManager {
    pythonGenerator;
    constructor() {
        this.pythonGenerator = new python_1.PythonCommentGenerator();
    }
    async addComments(editor, apiKey) {
        const document = editor.document;
        if (document.languageId === 'python') {
            await this.pythonGenerator.addPhilosophicalComments(editor, apiKey);
        }
        else {
            throw new Error(`Unsupported language: ${document.languageId}`);
        }
    }
}
function commentGenerator(context) {
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
        const apiKey = config.get('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');
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
            }
            else {
                vscode.window.showErrorMessage('API key is required!');
                return;
            }
        }
        //vscode.window.showInformationMessage('Adding philosophical chaos to your code...');
        try {
            await addCommentsManager.addComments(editor, apiKey);
            vscode.window.showInformationMessage('Successfully added philosophical comments! Your code is now 10x more enlightened and 100x more useless!');
        }
        catch (error) {
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
//# sourceMappingURL=main.js.map