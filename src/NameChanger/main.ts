import * as vscode from 'vscode';
import { getIdentifiers as getPythonIdentifiers } from './python';
import { getIdentifiers as getCIdentifiers } from './c';

export function nameChanger(context: vscode.ExtensionContext) {
    // Register the NameChanger command
    let nameChangerDisposable = vscode.commands.registerCommand('below_c_level.nameChanger', () => {
        runNameChanger();
    });

    context.subscriptions.push(nameChangerDisposable);
}

function runNameChanger() {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found!');
        return;
    }

    const document = editor.document;
    const fileName = document.fileName;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    if (!fileExtension) {
        vscode.window.showErrorMessage('Could not determine file type!');
        return;
    }

    switch (fileExtension) {
        case 'py':
            handlePythonFile(editor);
            break;
        case 'c':
            handleCFile(editor);
            break;
        // TODO: Add other file types as needed
        // case 'js':
        //     handleJavaScriptFile(editor);
        //     break;
        default:
            vscode.window.showErrorMessage(`File type .${fileExtension} is not supported yet!`);
    }
}

async function handlePythonFile(editor: vscode.TextEditor) {
    const document = editor.document;
    const text = document.getText();
    
    try {
        // Get user-defined identifiers from the Python file
        const identifiers = getPythonIdentifiers(text);
        
        if (identifiers.length === 0) {
            vscode.window.showInformationMessage('No user-defined identifiers found to insult!');
            return;
        }

        await processIdentifiers(editor, identifiers, text);

    } catch (error) {
        vscode.window.showErrorMessage(`Error processing Python file: ${error}`);
    }
}

async function handleCFile(editor: vscode.TextEditor) {
    const document = editor.document;
    const text = document.getText();
    
    try {
        // Get user-defined identifiers from the C file
        const identifiers = getCIdentifiers(text);
        
        if (identifiers.length === 0) {
            vscode.window.showInformationMessage('No user-defined identifiers found to insult!');
            return;
        }

        await processIdentifiers(editor, identifiers, text);

    } catch (error) {
        vscode.window.showErrorMessage(`Error processing C file: ${error}`);
    }
}

async function processIdentifiers(editor: vscode.TextEditor, identifiers: string[], text: string) {
    const document = editor.document;
    
    // Create mapping of original identifiers to Shakespearean insults
    const identifierMap = new Map<string, string>();
    const usedInsults = new Set<string>();
    
    for (const identifier of identifiers) {
        let insult = getShakespearianInsult();
        // Ensure we don't use the same insult twice
        while (usedInsults.has(insult)) {
            insult = getShakespearianInsult();
        }
        usedInsults.add(insult);
        identifierMap.set(identifier, insult);
    }

    // Replace identifiers in the text, but preserve strings and comments
    let newText = replaceIdentifiersPreservingStrings(text, identifierMap);

    // Apply the changes to the editor
    const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length)
    );

    await editor.edit(editBuilder => {
        editBuilder.replace(fullRange, newText);
    });

    // Show success message with the mapping
    const mappingString = Array.from(identifierMap.entries())
        .map(([orig, insult]) => `${orig} → ${insult}`)
        .join(', ');
    
    vscode.window.showInformationMessage(
        `Successfully insulted ${identifiers.length} identifier(s)! ${mappingString}`
    );
}

function getShakespearianInsult(): string {
    const adjectives1 = [
        'artless', 'bawdy', 'beslubbering', 'bootless', 'churlish', 'cockered', 
        'clouted', 'craven', 'currish', 'dankish', 'dissembling', 'droning',
        'errant', 'fawning', 'fobbing', 'froward', 'frothy', 'gleeking',
        'goatish', 'gorbellied', 'impertinent', 'infectious', 'jarring', 'loggerheaded',
        'lumpish', 'mammering', 'mangled', 'mewling', 'paunchy', 'pribbling',
        'puking', 'puny', 'qualling', 'rank', 'reeky', 'roguish',
        'ruttish', 'saucy', 'spleeny', 'spongy', 'surly', 'tottering',
        'unmuzzled', 'vain', 'venomed', 'villainous', 'warped', 'wayward',
        'weedy', 'yeasty', 'cullionly', 'fusty', 'caluminous', 'wimpled'
    ];

    const adjectives2 = [
        'base_court', 'bat_fowling', 'beef_witted', 'beetle_headed', 'boil_brained', 'clapper_clawed',
        'clay_brained', 'common_kissing', 'crook_pated', 'dismal_dreaming', 'dizzy_eyed', 'doghearted',
        'dread_bolted', 'earth_vexing', 'elf_skinned', 'fat_kidneyed', 'fen_sucked', 'flap_mouthed',
        'fly_bitten', 'folly_fallen', 'fool_born', 'full_gorged', 'guts_griping', 'half_faced',
        'hasty_witted', 'hedge_born', 'hell_hated', 'idle_headed', 'ill_breeding', 'ill_nurtured',
        'knotty_pated', 'milk_livered', 'motley_minded', 'onion_eyed', 'plume_plucked', 'pottle_deep',
        'pox_marked', 'reeling_ripe', 'rough_hewn', 'rude_growing', 'rump_fed', 'shard_borne',
        'sheep_biting', 'spur_galled', 'swag_bellied', 'tardy_gaited', 'tickle_brained', 'toad_spotted',
        'unchin_snouted', 'weather_bitten', 'whoreson', 'malmsey_nosed', 'rampallian', 'lily_livered'
    ];

    const nouns = [
        'apple_john', 'baggage', 'barnacle', 'bladder', 'boar_pig', 'bugbear',
        'bum_bailey', 'canker_blossom', 'clack_dish', 'clotpole', 'coxcomb', 'codpiece',
        'death_token', 'dewberry', 'flap_dragon', 'flax_wench', 'flirt_gill', 'foot_licker',
        'fustilarian', 'giglet', 'gudgeon', 'haggard', 'harpy', 'hedge_pig',
        'horn_beast', 'hugger_mugger', 'joithead', 'lewdster', 'lout', 'maggot_pie',
        'malt_worm', 'mammet', 'measle', 'minnow', 'miscreant', 'moldwarp',
        'mumble_news', 'nut_hook', 'pigeon_egg', 'pignut', 'puttock', 'pumpion',
        'ratsbane', 'scut', 'skainsmate', 'strumpet', 'varlot', 'vassal',
        'whey_face', 'wagtail', 'knave', 'villain', 'recreant', 'varlet',
        'muttonchop', 'blaggard', 'scurvy_knave', 'milk_sop', 'hedge_born_cur'
    ];

    const adj1 = adjectives1[Math.floor(Math.random() * adjectives1.length)];
    const adj2 = adjectives2[Math.floor(Math.random() * adjectives2.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adj1}_${adj2}_${noun}`;
}

function replaceIdentifiersPreservingStrings(code: string, identifierMap: Map<string, string>): string {
    let result = '';
    let i = 0;
    
    while (i < code.length) {
        const char = code[i];
        
        // Handle triple-quoted strings - preserve them completely
        if ((char === '"' || char === "'") && code.substr(i, 3) === char.repeat(3)) {
            const quote = char.repeat(3);
            const stringStart = i;
            i += 3;
            
            // Find the end of the triple-quoted string
            while (i < code.length - 2) {
                if (code.substr(i, 3) === quote) {
                    i += 3;
                    break;
                }
                i++;
            }
            
            // Add the entire string as-is
            result += code.substring(stringStart, i);
            continue;
        }
        
        // Handle regular strings - preserve them completely
        if (char === '"' || char === "'") {
            const quote = char;
            const stringStart = i;
            i++;
            
            while (i < code.length && code[i] !== quote) {
                if (code[i] === '\\') {
                    i += 2; // Skip escaped character
                } else {
                    i++;
                }
            }
            if (i < code.length) i++; // Skip closing quote
            
            // Add the entire string as-is
            result += code.substring(stringStart, i);
            continue;
        }
        
        // Handle comments - preserve them completely
        if (char === '#') {
            const commentStart = i;
            // Skip until end of line
            while (i < code.length && code[i] !== '\n') {
                i++;
            }
            if (i < code.length) {
                i++; // Include the newline
            }
            
            // Add the entire comment as-is
            result += code.substring(commentStart, i);
            continue;
        }
        
        // Check if we're at the start of an identifier
        if (/[a-zA-Z_]/.test(char)) {
            const identifierStart = i;
            
            // Extract the full identifier
            while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
                i++;
            }
            
            const identifier = code.substring(identifierStart, i);
            
            // Replace if it's in our map
            if (identifierMap.has(identifier)) {
                result += identifierMap.get(identifier)!;
            } else {
                result += identifier;
            }
            continue;
        }
        
        // Regular character - just add it
        result += char;
        i++;
    }
    
    return result;
}

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}