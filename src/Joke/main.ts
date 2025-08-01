import * as vscode from 'vscode';

let jokeInterval: NodeJS.Timeout | undefined;

export function activateJoke(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('below-c-level.getJoke', () => {
        showRandomJoke();
    });
    context.subscriptions.push(disposable);

    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('belowCLevel.autoJoke') || e.affectsConfiguration('belowCLevel.jokeFrequency')) {
            setupAutoJoke();
        }
    });

    setupAutoJoke();
}

function setupAutoJoke() {
    const config = vscode.workspace.getConfiguration('belowCLevel');
    const autoJoke = config.get<boolean>('autoJoke', false);
    const jokeFrequency = config.get<number>('jokeFrequency', 300000); // default 5 min

    if (jokeInterval) {
        clearInterval(jokeInterval);
        jokeInterval = undefined;
    }

    if (autoJoke) {
        jokeInterval = setInterval(() => {
            showRandomJoke();
        }, jokeFrequency);
    }
}

function showRandomJoke() {
    const Question: string[] = [
        "Why do front end developers eat lunch alone",
        "Why was the river rich?",
        "How do you generate a random string?",
        "Why did the programmer quit his job?",
        "What is a dying programmer's last program?"
    ];
    const Ans: string[] = [
        "Because they don't know how to join tables",
        "Because it had two banks",
        "Put a Windows user in front of Vim and tell them to exit.",
        "Because he didn't get arrays.",
        "Goodbye, world!"
    ];
    const QuestionDark: string[] = ["What's the difference between Harry Potter and the jews?"];
    const AnsDark: string[] = ["Harry escaped the chamber"];

    const length = Question.length;
    console.log("length", length);
    const index = Math.floor(Math.random() * (length));
    console.log(index);
    const chance = Math.random();
    if (chance < 0.5) {
        vscode.window.showInformationMessage(Question[index], 'Reveal').then((selection: any) => {
            if (selection === 'Reveal') {
                vscode.window.showInformationMessage(Ans[index]);
            }
        });
    } else {
        vscode.window.showInformationMessage("Why is assembly language wet", 'Reveal').then((selection: any) => {
            vscode.window.showInformationMessage("Because it is below c level");
        });
    }
}
