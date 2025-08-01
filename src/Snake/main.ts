import * as vscode from 'vscode';

interface Position {
    line: number;
    character: number;
}

let gameTimer: NodeJS.Timeout | undefined;
let gameActive = false;

export function activateSnake(context: vscode.ExtensionContext) {
    // Register manual command
    const disposable = vscode.commands.registerCommand('below-c-level.snake', () => {
        startSnake(context);
    });
    context.subscriptions.push(disposable);

    // React to configuration changes
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('belowCLevel.autoSnake') || e.affectsConfiguration('belowCLevel.snakeSpawnChance')) {
            setupAutoSnake(context);
        }
    });

    // Initial setup
    setupAutoSnake(context);
}

function setupAutoSnake(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('belowCLevel');
    const autoSnake = config.get<boolean>('autoSnake', false);

    if (gameTimer) {
        clearTimeout(gameTimer);
        gameTimer = undefined;
    }

    if (autoSnake) {
        startRandomTimer(context);
    }
}

function startRandomTimer(context: vscode.ExtensionContext) {
    if (gameTimer) {
        clearTimeout(gameTimer);
    }

    const config = vscode.workspace.getConfiguration('belowCLevel');
    const spawnChance = config.get<number>('snakeSpawnChance', 0.1);

    // Random time between 10–100 seconds
    const randomTime = (Math.random() * 90 + 10) * 1000;

    gameTimer = setTimeout(() => {
        if (!gameActive && Math.random() < spawnChance) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                startSnake(context);
            }
        }
        // Always schedule the next spawn
        startRandomTimer(context);
    }, randomTime);
}

function startSnake(context: vscode.ExtensionContext) {
    const editor = vscode.window.activeTextEditor;
    if (!editor || gameActive) {
        return;
    }
    const safeEditor = editor;

    const doc = safeEditor.document;
    const totalLines = doc.lineCount;
    const maxLineLength = Math.max(...Array.from({ length: totalLines }, (_, i) => doc.lineAt(i).text.length));

    if (!safeEditor.visibleRanges || safeEditor.visibleRanges.length === 0) {
        return;
    }

    gameActive = true;

    const visible = safeEditor.visibleRanges[0];
    const middleLine = Math.floor((visible.start.line + visible.end.line) / 2);
    const lineText = doc.lineAt(middleLine).text;
    const middleChar = Math.max(0, Math.floor(lineText.length / 2));

    let snake: Position[] = [{ line: middleLine, character: middleChar }];
    let apple: Position = randomApple();
    let direction: Position = { line: 0, character: 1 };
    let interval: NodeJS.Timeout | undefined;
    let commandDisposables: vscode.Disposable[] = [];

    const up = vscode.commands.registerCommand('below-c-level.snake.up', () => {
        if (gameActive && direction.line !== 1) direction = { line: -1, character: 0 };
    });
    const down = vscode.commands.registerCommand('below-c-level.snake.down', () => {
        if (gameActive && direction.line !== -1) direction = { line: 1, character: 0 };
    });
    const left = vscode.commands.registerCommand('below-c-level.snake.left', () => {
        if (gameActive && direction.character !== 1) direction = { line: 0, character: -1 };
    });
    const right = vscode.commands.registerCommand('below-c-level.snake.right', () => {
        if (gameActive && direction.character !== -1) direction = { line: 0, character: 1 };
    });

    commandDisposables.push(up, down, left, right);
    context.subscriptions.push(...commandDisposables);

    function randomApple(): Position {
        const vis = safeEditor.visibleRanges[0];
        const minLine = vis.start.line;
        const maxLine = Math.min(vis.end.line - 1, totalLines - 1);

        let attempts = 0;
        while (attempts < 50) {
            const randLine = getRandomInt(minLine, maxLine);
            const lineText = doc.lineAt(randLine).text;
            if (lineText.length > 3) {
                const randChar = getRandomInt(1, Math.max(1, lineText.length - 2));
                return { line: randLine, character: randChar };
            }
            attempts++;
        }
        return { line: minLine, character: 1 };
    }

    function draw() {
        if (!gameActive || !safeEditor) return;

        safeEditor.edit(editBuilder => {
            for (let i = 0; i < doc.lineCount; i++) {
                const lineText = doc.lineAt(i).text;
                if (lineText.length < maxLineLength + 1) {
                    const pad = " ".repeat(maxLineLength + 1 - lineText.length);
                    editBuilder.insert(new vscode.Position(i, lineText.length), pad);
                }
            }

            for (let dl = -1; dl <= 1; dl++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const line = apple.line + dl;
                    const ch = apple.character + dc;
                    if (line >= 0 && line < doc.lineCount && ch >= 0 && ch <= maxLineLength) {
                        const range = new vscode.Range(line, ch, line, ch + 1);
                        editBuilder.replace(range, "#");
                    }
                }
            }

            snake.forEach(pos => {
                if (pos.line >= 0 && pos.line < doc.lineCount && pos.character >= 0 && pos.character <= maxLineLength) {
                    const range = new vscode.Range(pos.line, pos.character, pos.line, pos.character + 1);
                    editBuilder.replace(range, "■");
                }
            });
        });
    }

    function step() {
        if (!gameActive || !safeEditor) return;

        const head = snake[0];
        const newHead: Position = {
            line: head.line + direction.line,
            character: head.character + direction.character,
        };

        if (newHead.line < 0 || newHead.line >= totalLines) {
            gameOver();
            return;
        }
        if (newHead.character < 0 || newHead.character > maxLineLength) {
            gameOver();
            return;
        }

        if (snake.some(segment => segment.line === newHead.line && segment.character === newHead.character)) {
            gameOver();
            return;
        }

        snake.unshift(newHead);

        if (Math.abs(newHead.line - apple.line) <= 1 && Math.abs(newHead.character - apple.character) <= 1) {
            victory();
            return;
        }

        const lineText = doc.lineAt(newHead.line).text;
        let currentChar: string | undefined;
        if (newHead.character < lineText.length) {
            currentChar = lineText[newHead.character];
        }

        if (!(currentChar && currentChar !== ' ' && currentChar !== '\t')) {
            snake.pop();
        }

        draw();
    }

    function gameOver() {
        stop();
        vscode.window.showWarningMessage("Game Over! രാജവെമ്പാല died.");
        startRandomTimer(context);
    }

    function victory() {
        stop();
        vscode.window.showInformationMessage("രാജവെമ്പാല defeated! Incident reported to Mananthavady forest department");
        startRandomTimer(context);
    }

    function getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function stop() {
        gameActive = false;
        if (interval) {
            clearInterval(interval);
            interval = undefined;
        }
        commandDisposables.forEach(d => d.dispose());
        commandDisposables = [];
    }

    const focusHandler = vscode.window.onDidChangeActiveTextEditor(e => {
        if (gameActive && e !== safeEditor) {
            vscode.window.showTextDocument(safeEditor.document, {
                viewColumn: safeEditor.viewColumn,
                preserveFocus: false
            });
        }
    });
    commandDisposables.push(focusHandler);
    context.subscriptions.push(focusHandler);

    draw();
    interval = setInterval(step, 200);
    vscode.window.showInformationMessage("Oh no! A wild രാജവെമ്പാല is attacking your code! Use arrow keys to guide it to the apple!");
}
