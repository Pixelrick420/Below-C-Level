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
exports.CCommentGenerator = void 0;
const vscode = __importStar(require("vscode"));
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: __dirname + '/../../.env' });
class CCommentGenerator {
    API_KEY = process.env.API_KEY;
    async callGroqAPI(conversationContext = "") {
        const prompt = `Generate a conversation between Aristotle and Plato as C comments. The conversation should:
1. Start with a serious philosophical discussion about the nature of reality
2. Gradually devolve into increasingly absurd and pointless arguments
3. Include completely ridiculous tangents about mundane things
4. Never reach any conclusion and keep going in circles
5. Be formatted as C comments (// at the start of each line)
6. Be around 10-15 lines long
7. Each philosopher should speak 2-3 times

${conversationContext ? `Continue this conversation context: ${conversationContext}` : "Start a new philosophical conversation that will inevitably become pointless."}

Make it hilariously stupid while maintaining their "philosophical" speaking style.`;
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.API_KEY}`,
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
        const data = await response.json();
        console.log("response", response, data);
        return data.choices[0].message.content;
    }
    getRandomConversationContext() {
        console.log("inside random conversation");
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
    findRandomInsertionPoints(document, count) {
        const lines = [];
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            // Skip empty lines and existing comments
            if (line.text.trim() && !line.text.trim().startsWith('//') && !line.text.trim().startsWith('/*')) {
                lines.push(i);
            }
        }
        // Shuffle and take random positions
        const shuffled = lines.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }
    getFallbackCommentLines() {
        const fallbackConversations = [
            '// Aristotle: "The essence of code is in its execution, not its beauty."',
            '// Plato: "But what of the perfect Form of an algorithm?"',
            '// Aristotle: "Forms? I\'m more concerned about why my compiler keeps warning me."',
            '// Plato: "Your compiler exists in the material world, thus it\'s imperfect!"',
            '// Aristotle: "So you\'re saying perfect compilation exists in some ideal realm?"',
            '// Plato: "Obviously! Along with perfect memory management and no segfaults."',
            '// Aristotle: "This is why C++ developers avoid us at conferences."',
            '// Plato: "Consider the allegory of the cave, but with malloc and free."',
            '// Aristotle: "Are you saying we\'re chained to our memory leaks?"',
            '// Plato: "Precisely! And garbage collection is the sun!"',
            '// Aristotle: "That\'s... actually explains why Java developers seem so enlightened."',
            '// Plato: "Wait, did we just praise garbage collection?"',
            '// Aristotle: "Quick! Say something about pointers before people notice!"',
            '// Plato: "Um... do you think NULL pointers dream of electric sheep?"',
            '// Aristotle: "There we go. Reputation salvaged."',
            '// Aristotle: "Logic dictates that this function should compile without warnings."',
            '// Plato: "But does \'warning-free\' exist independently of our compiler settings?"',
            '// Aristotle: "Plato, the code either compiles or it doesn\'t."',
            '// Plato: "But what if it compiles in another universe with different standards?"',
            '// Aristotle: "That\'s... that\'s called a different compiler."',
            '// Plato: "Is GCC not just a cave casting shadows of machine code?"',
            '// Aristotle: "I need coffee. Do you want coffee?"',
            '// Plato: "Is coffee the Form of productivity, or just caffeinated water?"',
            '// Aristotle: "I\'m getting decaf. For both of us."'
        ];
        return fallbackConversations;
    }
    async addCommentsSequentially(editor) {
        const document = editor.document;
        const codeLines = [];
        // Find all non-empty, non-comment lines
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const trimmedText = line.text.trim();
            if (trimmedText && !trimmedText.startsWith('//') && !trimmedText.startsWith('/*')) {
                codeLines.push(i);
            }
        }
        if (codeLines.length === 0) {
            throw new Error('No suitable code lines found in the C file!');
        }
        let conversationLines = [];
        let conversationIndex = 0;
        // Generate conversation lines (either from API or fallback)
        try {
            const context = this.getRandomConversationContext();
            const conversation = await this.callGroqAPI(context);
            conversationLines = conversation.split('\n').filter(line => line.trim());
        }
        catch (error) {
            console.error('Failed to generate conversation from API, using fallback:', error);
            conversationLines = this.getFallbackCommentLines();
        }
        // Calculate maximum number of debate lines based on code lines
        const maxDebateLines = Math.floor(codeLines.length / 2.5);
        // Insert comments after every 3-4 lines of code, but limit total debate lines
        const insertions = [];
        for (let i = 0; i < codeLines.length && insertions.length < maxDebateLines; i++) {
            // Insert a comment after every 3-4 lines of code
            if (i > 0 && (i % 3 === 0 || i % 4 === 0)) {
                if (conversationIndex < conversationLines.length) {
                    const lineToInsertAfter = codeLines[i - 1];
                    insertions.push({
                        line: lineToInsertAfter + 1,
                        comment: conversationLines[conversationIndex]
                    });
                    conversationIndex++;
                }
            }
        }
        // Sort insertions in reverse order to maintain line numbers
        insertions.sort((a, b) => b.line - a.line);
        // Insert comments one by one
        for (const insertion of insertions) {
            await editor.edit(editBuilder => {
                const position = new vscode.Position(insertion.line, 0);
                editBuilder.insert(position, insertion.comment + '\n');
            });
            // Small delay to avoid issues
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}
exports.CCommentGenerator = CCommentGenerator;
//# sourceMappingURL=c.js.map