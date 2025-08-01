"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const main_1 = require("./Joke/main");
const main_2 = require("./NameChanger/main");
const main_3 = require("./Snake/main");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    (0, main_1.getJoke)(context);
    (0, main_2.nameChanger)(context);
    (0, main_3.snakeGame)(context);
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map