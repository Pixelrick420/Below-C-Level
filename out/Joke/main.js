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
exports.getJoke = getJoke;
const vscode = __importStar(require("vscode"));
function getJoke(context) {
    const disposable = vscode.commands.registerCommand('below-c-level.getJoke', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        const Question = ["Why do front end developers eat lunch alone"];
        const Ans = ["Because they don't know how to join tables"];
        context.subscriptions.push(disposable);
        const index = Math.floor(Math.random() * 3 + 1);
        vscode.window.showInformationMessage(Question[index]).(selection => {
            if (selection === 'Click Me') {
                vscode.window.showInformationMessage('You clicked the button!');
            }
        });
        ;
    });
}
//# sourceMappingURL=main.js.map