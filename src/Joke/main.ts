import * as vscode from 'vscode';
export function getJoke(context: vscode.ExtensionContext){
    const disposable = vscode.commands.registerCommand('below-c-level.getJoke', () => {
            // The code you place here will be executed every time your command is executed
            // Display a message box to the user
            const Question:string[]=["Why do front end developers eat lunch alone"]
            const Ans:string[]=["Because they don't know how to join tables"]
            context.subscriptions.push(disposable);
            const index=Math.floor(Math.random()*3+1);
            
            vscode.window.showInformationMessage(Question[index]).(selection => {
      if (selection === 'Click Me') {
        vscode.window.showInformationMessage('You clicked the button!');
      }
    });;
        });
    
        
}