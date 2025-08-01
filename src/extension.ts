import * as vscode from 'vscode';
import { activateJoke } from './Joke/main';
import { activateNameChanger } from './NameChanger/main';
import { activateSnake } from './Snake/main';
import { WebViewProvider } from './WebViewProvider';
import { activateFibonacci } from './Fibonacci/main';

// Global variable to track NSFW jokes status
let nsfwJokesEnabled = false;

export function activate(context: vscode.ExtensionContext) {
	activateJoke(context);
	activateNameChanger(context);
	activateSnake(context);
	activateFibonacci(context);

	const openPanelCommand = vscode.commands.registerCommand('below-c-level.openDashboard', () => {
		WebViewProvider.createOrShow(context.extensionUri);
	});
	const openSettingsCommand = vscode.commands.registerCommand('below-c-level.openSettings', () => {
		WebViewProvider.createOrShow(context.extensionUri);
	});

	// Handler for NSFW jokes toggle
	const nsfwJokesToggleCommand = vscode.commands.registerCommand('below-c-level.nsfwJokesToggled', (enabled: boolean) => {
		nsfwJokesEnabled = enabled;
		console.log(`NSFW Jokes ${enabled ? 'enabled' : 'disabled'}`);
		
		// Show notification
		if (enabled) {
			vscode.window.showWarningMessage('NSFW Jokes enabled! Use responsibly.');
		} else {
			vscode.window.showInformationMessage('NSFW Jokes disabled.');
		}
		
		// You can add additional logic here to pass this state to your joke module
		// For example, if your joke module has a function to set NSFW mode:
		// setNsfwJokesMode(enabled);
	});

	context.subscriptions.push(openPanelCommand, openSettingsCommand, nsfwJokesToggleCommand);

	const configChangeListener = vscode.workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('belowCLevel')) {
			vscode.window.showInformationMessage('Below C Level settings updated!');
		}
	});
	context.subscriptions.push(configChangeListener);
}

// Getter function to access NSFW jokes status from other modules
export function isNsfwJokesEnabled(): boolean {
	return nsfwJokesEnabled;
}

export function deactivate() {}