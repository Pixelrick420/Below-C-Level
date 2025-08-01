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
exports.nameChanger = nameChanger;
const vscode = __importStar(require("vscode"));
const python_1 = require("./python");
function nameChanger(context) {
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
        // TODO: Add other file types as needed
        // case 'js':
        //     handleJavaScriptFile(editor);
        //     break;
        default:
            vscode.window.showErrorMessage(`File type .${fileExtension} is not supported yet!`);
    }
}
async function handlePythonFile(editor) {
    const document = editor.document;
    const text = document.getText();
    try {
        const identifiers = (0, python_1.getIdentifiers)(text);
        if (identifiers.length === 0) {
            vscode.window.showInformationMessage('No user-defined identifiers found to insult!');
            return;
        }
        const identifierMap = new Map();
        const usedInsults = new Set();
        for (const identifier of identifiers) {
            let insult = getShakespearianInsult();
            while (usedInsults.has(insult)) {
                insult = getShakespearianInsult();
            }
            usedInsults.add(insult);
            identifierMap.set(identifier, insult);
        }
        let newText = text;
        for (const [original, insult] of identifierMap) {
            const regex = new RegExp(`\\b${escapeRegExp(original)}\\b`, 'g');
            newText = newText.replace(regex, insult);
        }
        const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
        await editor.edit(editBuilder => {
            editBuilder.replace(fullRange, newText);
        });
        const mappingString = Array.from(identifierMap.entries())
            .map(([orig, insult]) => `${orig} → ${insult}`)
            .join(', ');
        vscode.window.showInformationMessage(`Successfully insulted ${identifiers.length} identifier(s)! ${mappingString}`);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error processing Python file: ${error}`);
    }
}
function getShakespearianInsult() {
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
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
//# sourceMappingURL=main.js.map