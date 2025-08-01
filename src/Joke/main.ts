import * as vscode from 'vscode';
import { isNsfwJokesEnabled } from '../extension';

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
    var Question: string[] = [
        "Why do front end developers eat lunch alone",
        "Why was the river rich?",
        "How do you generate a random string?",
        "Why did the programmer quit his job?",
        "What is a dying programmer's last program?",
        "What's the best thing about Switzerland?",
        "What's the object-oriented way to become wealthy?",
        "What do Santa's little helpers learn at school?",
        "Where do sick cruise ships go to get healthy?",
        "Why did the koala get rejected?",
        "Which is faster, Hot or cold?",
        "How do construction workers party?",
        "I WRITE MY JOKES IN CAPITALS."

    ];
    const Ans: string[] = [
        "Because they don't know how to join tables",
        "Because it had two banks",
        "Put a Windows user in front of Vim and tell them to exit.",
        "Because he didn't get arrays.",
        "Goodbye, world!",
        "I don't know, but the flag is a big plus.",
        "Inheritance.",
        "The elf-abet!",
        "The dock!",
        "Because he did not have any koalafication.",
        "Hot, because you can catch a cold",
        "They raise the roof.",
        "THIS ONE WAS WRITTEN IN PARIS."
        
    ];
    const QuestionDark: string[] = ["What's the difference between Harry Potter and the jews?",
        "What did the boy with no arms get for Christmas?",
        "Why can't orphans play baseball?",
       
    ];
    const AnsDark: string[] = ["Harry escaped the chamber",
        "I don't know, he hasn't opened it yet.",
        "They don't know where home is."
    ];

    const length = Question.length;
    console.log("length", length);
    const index = Math.floor(Math.random() * (length));
    console.log(index);
    const chance = Math.random();
    if (chance < 1) {
        vscode.window.showInformationMessage(Question[index], 'Reveal').then((selection: any) => {
            if (selection === 'Reveal') {
                vscode.window.showInformationMessage(Ans[index]);
            }
        });
    } else {
        vscode.window.showInformationMessage("Why is assembly language wet", 'Reveal').then((selection: any) => {
            if (selection === 'Reveal') {
                vscode.window.showInformationMessage(Ans[index]);
            }
        });
    }
}
