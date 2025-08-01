import * as vscode from 'vscode';

interface GroqResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

export class PythonCommentGenerator {
    private async callGroqAPI(apiKey: string, conversationContext: string = ""): Promise<string> {
        const prompt = `Generate a conversation between Aristotle and Plato as Python comments. The conversation should:
1. Start with a serious philosophical discussion about the nature of reality
2. Gradually devolve into increasingly absurd and pointless arguments
3. Include completely ridiculous tangents about mundane things
4. Never reach any conclusion and keep going in circles
5. Be formatted as Python comments (# at the start of each line)
6. Be around 10-15 lines long
7. Each philosopher should speak 2-3 times

${conversationContext ? `Continue this conversation context: ${conversationContext}` : "Start a new philosophical conversation that will inevitably become pointless."}

Make it hilariously stupid while maintaining their "philosophical" speaking style.`;

        const response:any = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a comedy writer creating absurd philosophical conversations for code comments. Make them start serious then become hilariously pointless.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.9
            })
        });

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
        }

        const data: GroqResponse = await response.json();
        return data.choices[0].message.content;
    }

    private getRandomConversationContext(): string {
        const contexts = [
            "continuing their debate about whether a hot dog is a sandwich",
            "arguing about the correct way to pronounce 'gif'",
            "discussing whether pineapple belongs on pizza",
            "debating the philosophical implications of left socks disappearing",
            "arguing about whether cereal is soup",
            "discussing the metaphysics of why toast always lands butter-side down",
            "debating whether a chair is still a chair if no one sits on it",
            "arguing about the optimal temperature for drinking water",
            "discussing the existential crisis of choosing what to watch on Netflix"
        ];
        return contexts[Math.floor(Math.random() * contexts.length)];
    }

    private findRandomInsertionPoints(document: vscode.TextDocument, count: number): number[] {
        const lines = [];
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            // Skip empty lines and existing comments
            if (line.text.trim() && !line.text.trim().startsWith('#')) {
                lines.push(i);
            }
        }

        // Shuffle and take random positions
        const shuffled = lines.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    async addPhilosophicalComments(editor: vscode.TextEditor, apiKey: string): Promise<void> {
        const document = editor.document;
        const insertionPoints = this.findRandomInsertionPoints(document, 3); // Add 3 conversations

        if (insertionPoints.length === 0) {
            throw new Error('No suitable insertion points found in the Python file!');
        }

        await editor.edit(editBuilder => {
            // Sort insertion points in reverse order to maintain line numbers
            insertionPoints.sort((a, b) => b - a);

            insertionPoints.forEach(async (lineNumber, index) => {
                try {
                    const context = index === 0 ? "" : this.getRandomConversationContext();
                    const conversation = await this.callGroqAPI(apiKey, context);
                    
                    // Add some spacing and the conversation
                    const commentBlock = `\n# ===================== PHILOSOPHICAL INTERLUDE =====================\n${conversation}\n# ================================================================\n\n`;
                    
                    const position = new vscode.Position(lineNumber, 0);
                    editBuilder.insert(position, commentBlock);
                } catch (error) {
                    console.error(`Failed to generate conversation for line ${lineNumber}:`, error);
                    // Fallback to a static absurd conversation
                    const fallbackConversation = `# ===================== PHILOSOPHICAL INTERLUDE =====================
# Aristotle: "The nature of being is fundamentally about actualized potential..."
# Plato: "But surely the Forms represent true reality beyond mere appearances?"
# Aristotle: "Wait, are we talking about reality or about why my sandwich tastes weird?"
# Plato: "Your sandwich? I was discussing the eternal nature of Truth!"
# Aristotle: "Yeah but like, do you think mayonnaise is a social construct?"
# Plato: "...what even is mayonnaise in the realm of pure Ideas?"
# Aristotle: "Exactly! That's what I'm saying! Also, is a hot dog a sandwich?"
# Plato: "This conversation has achieved perfect meaninglessness."
# Aristotle: "Finally, we agree on something!"
# ================================================================`;
                    
                    const position = new vscode.Position(lineNumber, 0);
                    editBuilder.insert(position, fallbackConversation + '\n\n');
                }
            });
        });

        // Since we can't await inside editBuilder, we need to make separate API calls
        // Let's do it properly with a different approach
        await this.addCommentsSequentially(editor, apiKey, insertionPoints);
    }

    private async addCommentsSequentially(editor: vscode.TextEditor, apiKey: string, insertionPoints: number[]): Promise<void> {
        // Sort in reverse order to maintain line numbers
        insertionPoints.sort((a, b) => b - a);
        
        for (let i = 0; i < insertionPoints.length; i++) {
            const lineNumber = insertionPoints[i];
            
            try {
                const context = i === 0 ? "" : this.getRandomConversationContext();
                const conversation = await this.callGroqAPI(apiKey, context);
                
                await editor.edit(editBuilder => {
                    const commentBlock = `\n# ===================== PHILOSOPHICAL INTERLUDE =====================\n${conversation}\n# ================================================================\n\n`;
                    const position = new vscode.Position(lineNumber, 0);
                    editBuilder.insert(position, commentBlock);
                });
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`Failed to generate conversation for line ${lineNumber}:`, error);
                
                // Fallback conversation
                const fallbackConversations = [
                    `# ===================== PHILOSOPHICAL INTERLUDE =====================
# Aristotle: "The essence of code is in its execution, not its beauty."
# Plato: "But what of the perfect Form of an algorithm?"
# Aristotle: "Forms? I'm more concerned about why my WiFi keeps disconnecting."
# Plato: "Your WiFi exists in the material world, thus it's imperfect!"
# Aristotle: "So you're saying perfect WiFi exists in some ideal realm?"
# Plato: "Obviously! Along with perfect pizza and comfortable chairs."
# Aristotle: "This is why nobody invites us to parties anymore."
# ================================================================`,

                    `# ===================== PHILOSOPHICAL INTERLUDE =====================
# Plato: "Consider the allegory of the cave, but with programmers."
# Aristotle: "Are you saying we're chained to our monitors?"
# Plato: "Precisely! And Stack Overflow is the sun!"
# Aristotle: "That's... actually not a terrible metaphor."
# Plato: "Wait, did we just agree on something useful?"
# Aristotle: "Quick! Say something pointless before people notice!"
# Plato: "Um... do you think rubber ducks have feelings?"
# Aristotle: "There we go. Crisis averted."
# ================================================================`,

                    `# ===================== PHILOSOPHICAL INTERLUDE =====================
# Aristotle: "Logic dictates that this function should work."
# Plato: "But does 'working' exist independently of our perception?"
# Aristotle: "Plato, the code either runs or it doesn't."
# Plato: "But what if it runs in another dimension?"
# Aristotle: "That's... that's called a different server."
# Plato: "Is a server not just a cave casting shadows of data?"
# Aristotle: "I need coffee. Do you want coffee?"
# Plato: "Is coffee the Form of awakeness, or just bean water?"
# Aristotle: "I'm getting decaf. For both of us."
# ================================================================`
                ];
                
                const fallback = fallbackConversations[i % fallbackConversations.length];
                
                await editor.edit(editBuilder => {
                    const position = new vscode.Position(lineNumber, 0);
                    editBuilder.insert(position, fallback + '\n\n');
                });
            }
        }
    }
}