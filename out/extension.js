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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const main_1 = require("./Joke/main");
const main_2 = require("./NameChanger/main");
const main_3 = require("./Snake/main");
const WebViewProvider_1 = require("./WebViewProvider");
const main_4 = require("./CommentGenerator/main");
function activate(context) {
    (0, main_1.activateJoke)(context);
    (0, main_2.activateNameChanger)(context);
    (0, main_3.activateSnake)(context);
    (0, main_4.commentGenerator)(context);
    const openPanelCommand = vscode.commands.registerCommand('below-c-level.openDashboard', () => {
        WebViewProvider_1.WebViewProvider.createOrShow(context.extensionUri);
    });
    const openSettingsCommand = vscode.commands.registerCommand('below-c-level.openSettings', () => {
        WebViewProvider_1.WebViewProvider.createOrShow(context.extensionUri);
    });
    context.subscriptions.push(openPanelCommand, openSettingsCommand);
    vscode.commands.executeCommand('below-c-level.openDashboard');
    const configChangeListener = vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('belowCLevel')) {
            vscode.window.showInformationMessage('Below C Level settings updated!');
        }
    });
    context.subscriptions.push(configChangeListener);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map