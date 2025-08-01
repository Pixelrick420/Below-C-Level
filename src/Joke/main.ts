import * as vscode from 'vscode';
export function getJoke(context: vscode.ExtensionContext){
    const disposable = vscode.commands.registerCommand('below-c-level.getJoke', () => {
            // The code you place here will be executed every time your command is executed
            // Display a message box to the user
            const Question:string[]=["Why do front end developers eat lunch alone","Why was the river rich?","How do you generate a random string?","Why did the programmer quit his job?","What is a dying programmer's last program?"]
            const Ans:string[]=["Because they don't know how to join tables","Because it had two banks","Put a Windows user in front of Vim and tell them to exit.","Because he didn't get arrays.","Goodbye, world!"]
            const QuestionDark:string[]=["What's the difference between Harry Potter and the jews?"]
            const AnsDark:string[]=["Harry escaped the chamber"]
            const length=Question.length;
            console.log("length",length);
            const index=Math.floor(Math.random() * (length));
            console.log(index);
            const chance=Math.random();
            if (chance<0.5){
                vscode.window.showInformationMessage(Question[index],'Reveal').then((selection:any) => {
                if (selection === 'Reveal') {
                    vscode.window.showInformationMessage(Ans[index]);
                }
                });
            }
            else{
                vscode.window.showInformationMessage("Why is assembly language wet",'Reveal').then((selection:any)=>{
                    vscode.window.showInformationMessage("Because it is below c level");
                })
            }    

            })
            
    
        context.subscriptions.push(disposable);
}