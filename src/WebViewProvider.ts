import * as vscode from 'vscode';

export class WebViewProvider {
    private static currentPanel: vscode.WebviewPanel | undefined;

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (WebViewProvider.currentPanel) {
            WebViewProvider.currentPanel.reveal(column);
            WebViewProvider.updateContent(extensionUri);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            'belowCLevel',
            'Below C Level',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        WebViewProvider.currentPanel = panel;
        WebViewProvider.updateContent(extensionUri);

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'updateSetting':
                        vscode.workspace.getConfiguration('belowCLevel').update(
                            message.setting,
                            message.value,
                            vscode.ConfigurationTarget.Global
                        );
                        // Refresh the webview to show updated settings
                        setTimeout(() => {
                            if (WebViewProvider.currentPanel) {
                                WebViewProvider.updateContent(extensionUri);
                            }
                        }, 100);
                        return;
                    case 'runCommand':
                        vscode.commands.executeCommand(message.commandId);
                        return;
                }
            },
            undefined
        );

        // Reset when the current panel is closed
        panel.onDidDispose(() => {
            WebViewProvider.currentPanel = undefined;
        }, null);
    }

    private static updateContent(extensionUri: vscode.Uri) {
    if (!WebViewProvider.currentPanel) return;

    const config = vscode.workspace.getConfiguration('belowCLevel');
    const settings = {
        autoNameChange: config.get<boolean>('autoNameChange'),
        autoSnake: config.get<boolean>('autoSnake'),
        autoJoke: config.get<boolean>('autoJoke'),
        snakeSpawnChance: config.get<number>('snakeSpawnChance'),
        jokeFrequency: config.get<number>('jokeFrequency'),
        nameChangeDelay: config.get<number>('nameChangeDelay'),
        autoFibonacci: config.get<boolean>('autoFibonacci'),
        fibonacciDelay: config.get<number>('fibonacciDelay')
    };

    console.log("Settings being passed to WebView:", settings);

    WebViewProvider.currentPanel.webview.html =
        WebViewProvider.getWebviewContent(settings);
}

    private static getWebviewContent(settings: any): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Below C Level</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-foreground);
            margin: 0;
            padding: 24px;
            line-height: 1.5;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
        }

        .header {
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 16px;
            margin-bottom: 32px;
        }

        .title {
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: var(--vscode-foreground);
        }

        .subtitle {
            color: var(--vscode-descriptionForeground);
            margin: 0;
        }

        .section {
            margin-bottom: 32px;
        }

        .section-title {
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 16px 0;
            color: var(--vscode-foreground);
        }

        .feature {
            background-color: var(--vscode-sidebar-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 16px;
            margin-bottom: 16px;
        }

        .feature-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }

        .feature-name {
            font-weight: 500;
            color: var(--vscode-foreground);
        }

        .feature-description {
            color: var(--vscode-descriptionForeground);
            font-size: 14px;
            margin-bottom: 16px;
        }

        .controls {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .control-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .control-label {
            color: var(--vscode-foreground);
            font-size: 14px;
        }

        .toggle-switch {
            position: relative;
            width: 44px;
            height: 24px;
            background-color: var(--vscode-button-secondaryBackground);
            border-radius: 12px;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .toggle-switch.active {
            background-color: var(--vscode-focusBorder);
        }

        .toggle-slider {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 20px;
            height: 20px;
            background-color: white;
            border-radius: 50%;
            transition: transform 0.2s;
        }

        .toggle-switch.active .toggle-slider {
            transform: translateX(20px);
        }

        .number-input {
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            padding: 4px 8px;
            color: var(--vscode-input-foreground);
            width: 80px;
            font-size: 14px;
        }

        .number-input:focus {
            outline: 1px solid var(--vscode-focusBorder);
            border-color: var(--vscode-focusBorder);
        }

        .slider-container {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 200px;
        }

        .slider {
            flex: 1;
            height: 4px;
            border-radius: 2px;
            background: var(--vscode-button-secondaryBackground);
            outline: none;
            -webkit-appearance: none;
        }

        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--vscode-focusBorder);
            cursor: pointer;
        }

        .slider-value {
            min-width: 40px;
            font-size: 14px;
            color: var(--vscode-foreground);
        }

        .actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }

        .btn {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 2px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 13px;
            transition: background-color 0.2s;
        }

        .btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .btn-secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .status {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }

        .status.enabled {
            color: var(--vscode-foreground);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">Below C Level</h1>
            <p class="subtitle">Extension configuration</p>
        </div>

        <div class="section">
            <h2 class="section-title">Features</h2>

            <div class="feature">
                <div class="feature-header">
                    <div class="feature-name">Name Changer</div>
                    <div class="status ${settings.autoNameChange ? 'enabled' : ''}">
                        ${settings.autoNameChange ? 'Auto enabled' : 'Manual only'}
                    </div>
                </div>
                <div class="feature-description">
                    Replaces variable names with Shakespearean insults
                </div>
                <div class="controls">
                    <div class="control-row">
                        <span class="control-label">Auto rename</span>
                        <div class="toggle-switch ${settings.autoNameChange ? 'active' : ''}" 
                             onclick="updateSetting('autoNameChange', ${!settings.autoNameChange})">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    <div class="control-row">
                        <span class="control-label">Delay (ms)</span>
                        <input type="number" class="number-input" value="${settings.nameChangeDelay}" 
                               onchange="updateSetting('nameChangeDelay', parseInt(this.value))" 
                               min="1000" max="60000" step="1000">
                    </div>
                </div>

            </div>

            <div class="feature">
                <div class="feature-header">
                    <div class="feature-name">Snake Game</div>
                    <div class="status ${settings.autoSnake ? 'enabled' : ''}">
                        ${settings.autoSnake ? 'Auto spawn' : 'Manual only'}
                    </div>
                </div>
                <div class="feature-description">
                    Spawns a snake that eats your code
                </div>
                <div class="controls">
                    <div class="control-row">
                        <span class="control-label">Auto spawn</span>
                        <div class="toggle-switch ${settings.autoSnake ? 'active' : ''}" 
                             onclick="updateSetting('autoSnake', ${!settings.autoSnake})">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    <div class="control-row">
                        <span class="control-label">Spawn chance</span>
                        <div class="slider-container">
                            <input type="range" class="slider" min="0" max="1" step="0.1" 
                                   value="${settings.snakeSpawnChance}" 
                                   onchange="updateSetting('snakeSpawnChance', parseFloat(this.value))">
                            <span class="slider-value">${Math.round(settings.snakeSpawnChance * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="feature">
                <div class="feature-header">
                    <div class="feature-name">Tech Jokes</div>
                    <div class="status ${settings.autoJoke ? 'enabled' : ''}">
                        ${settings.autoJoke ? 'Auto enabled' : 'Manual only'}
                    </div>
                </div>
                <div class="feature-description">
                    Displays random tech jokes
                </div>
                <div class="controls">
                    <div class="control-row">
                        <span class="control-label">Auto jokes</span>
                        <div class="toggle-switch ${settings.autoJoke ? 'active' : ''}" 
                             onclick="updateSetting('autoJoke', ${!settings.autoJoke})">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    <div class="control-row">
                        <span class="control-label">Frequency (ms)</span>
                        <input type="number" class="number-input" value="${settings.jokeFrequency}" 
                               onchange="updateSetting('jokeFrequency', parseInt(this.value))" 
                               min="60000" max="3600000" step="60000">
                    </div>
                </div>
                <div class="actions">
                    <button class="btn" onclick="runCommand('below-c-level.getJoke')">Tell joke</button>
                </div>
            </div>
            <div class="feature">
                <div class="feature-header">
                    <div class="feature-name">Fibonacci Indentation</div>
                    <div class="status ${settings.autoFibonacci ? 'enabled' : ''}">
                        ${settings.autoFibonacci ? 'Auto enabled' : 'Manual only'}
                    </div>
                </div>
                <div class="feature-description">
                    Indents code using Fibonacci spacing for each nested block
                </div>
                <div class="controls">
                    <div class="control-row">
                        <span class="control-label">Auto tab</span>
                        <div class="toggle-switch ${settings.autoFibonacci ? 'active' : ''}"
                            onclick="updateSetting('autoFibonacci', ${!settings.autoFibonacci})">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                    <div class="control-row">
                        <span class="control-label">Delay (ms)</span>
                        <input type="number" class="number-input" value="${settings.fibonacciDelay}"
                            onchange="updateSetting('fibonacciDelay', parseInt(this.value))"
                            min="1000" max="60000" step="1000">
                    </div>
                </div>
                <div class="actions">
                    <button class="btn" onclick="runCommand('below-c-level.fibonacciIndent')">Run now</button>
                </div>
</div>

        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function updateSetting(setting, value) {
            vscode.postMessage({
                command: 'updateSetting',
                setting: setting,
                value: value
            });
        }
        
        function runCommand(commandId) {
            vscode.postMessage({
                command: 'runCommand',
                commandId: commandId
            });
        }

        // Update slider display
        document.querySelectorAll('.slider').forEach(slider => {
            slider.addEventListener('input', function() {
                const valueSpan = this.parentElement.querySelector('.slider-value');
                valueSpan.textContent = Math.round(this.value * 100) + '%';
            });
        });
    </script>
</body>
</html>`;
    }
}