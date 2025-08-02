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
exports.activateJoke = activateJoke;
const vscode = __importStar(require("vscode"));
const extension_1 = require("../extension");
let jokeInterval;
function activateJoke(context) {
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
    const autoJoke = config.get('autoJoke', false);
    const jokeFrequency = config.get('jokeFrequency', 300000); // default 5 min
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
    var Question = [
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
    const Ans = [
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
    const QuestionDark = [
        "What's the difference between Harry Potter and the jews?",
        "What did the boy with no arms get for Christmas?",
        "Why can't orphans play baseball?"
    ];
    const AnsDark = [
        "Harry escaped the chamber",
        "I don't know, he hasn't opened it yet.",
        "They don't know where home is."
    ];
    try {
        // Safely check if NSFW jokes are enabled
        let nsfwEnabled = false;
        try {
            nsfwEnabled = (0, extension_1.isNsfwJokesEnabled)();
        }
        catch (error) {
            console.log("Error getting NSFW status, defaulting to false:", error);
            nsfwEnabled = false;
        }
        const activeQuestions = nsfwEnabled ? Question.concat(QuestionDark) : Question;
        const activeAnswers = nsfwEnabled ? Ans.concat(AnsDark) : Ans;
        const length = activeQuestions.length;
        console.log("length", length);
        const index = Math.floor(Math.random() * length);
        console.log(index);
        const chance = Math.random();
        // Fixed: chance < 0.5 for 50% probability instead of < 1
        if (chance < 0.5) {
            vscode.window.showInformationMessage(activeQuestions[index], 'Reveal').then((selection) => {
                if (selection === 'Reveal') {
                    vscode.window.showInformationMessage(activeAnswers[index]);
                }
            });
        }
        else {
            // Inside joke: always show the same joke 50% of the time
            vscode.window.showInformationMessage("Why is assembly language wet", 'Reveal').then((selection) => {
                if (selection === 'Reveal') {
                    vscode.window.showInformationMessage("Because it is below C level");
                }
            });
        }
    }
    catch (error) {
        console.error("Error in showRandomJoke:", error);
        // Fallback to a simple joke without any complex logic
        vscode.window.showInformationMessage("Why do programmers prefer dark mode?", 'Reveal').then((selection) => {
            if (selection === 'Reveal') {
                vscode.window.showInformationMessage("Because light attracts bugs!");
            }
        });
    }
}
//# sourceMappingURL=main.js.map