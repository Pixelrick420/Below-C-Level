import * as vscode from 'vscode';
import { activateJoke } from './Joke/main';
import { activateNameChanger } from './NameChanger/main';
import { activateSnake } from './Snake/main';
import { WebViewProvider } from './WebViewProvider';
import { addFibonacci } from './Fibonacci/main';

export function activate(context: vscode.ExtensionContext) {
	activateJoke(context);
	activateNameChanger(context);
	activateSnake(context);

	const openPanelCommand = vscode.commands.registerCommand('below-c-level.openDashboard', () => {
		WebViewProvider.createOrShow(context.extensionUri);
	});
	const openSettingsCommand = vscode.commands.registerCommand('below-c-level.openSettings', () => {
		WebViewProvider.createOrShow(context.extensionUri);
	});

	context.subscriptions.push(openPanelCommand, openSettingsCommand);

	const configChangeListener = vscode.workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('belowCLevel')) {
			vscode.window.showInformationMessage('Below C Level settings updated!');
		}
	});
	context.subscriptions.push(configChangeListener);
}

export function deactivate() {}
