export function getIdentifiers(pythonCode: string): string[] {
    const identifiers = new Set<string>();
    
    // Python built-in functions and keywords to exclude
    const builtins = new Set([
        // Built-in functions
        'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'breakpoint', 'bytearray', 'bytes',
        'callable', 'chr', 'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir',
        'divmod', 'enumerate', 'eval', 'exec', 'filter', 'float', 'format', 'frozenset',
        'getattr', 'globals', 'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int',
        'isinstance', 'issubclass', 'iter', 'len', 'list', 'locals', 'map', 'max',
        'memoryview', 'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print',
        'property', 'range', 'repr', 'reversed', 'round', 'set', 'setattr', 'slice',
        'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip',
        '__import__',
        
        // Keywords
        'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break',
        'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally',
        'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal',
        'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
        
        // Common module names and exceptions
        'ArithmeticError', 'AssertionError', 'AttributeError', 'BaseException', 'BlockingIOError',
        'BrokenPipeError', 'BufferError', 'BytesWarning', 'ChildProcessError', 'ConnectionAbortedError',
        'ConnectionError', 'ConnectionRefusedError', 'ConnectionResetError', 'DeprecationWarning',
        'EOFError', 'Ellipsis', 'EnvironmentError', 'Exception', 'FileExistsError',
        'FileNotFoundError', 'FloatingPointError', 'FutureWarning', 'GeneratorExit',
        'IOError', 'ImportError', 'ImportWarning', 'IndentationError', 'IndexError',
        'InterruptedError', 'IsADirectoryError', 'KeyError', 'KeyboardInterrupt',
        'LookupError', 'MemoryError', 'ModuleNotFoundError', 'NameError', 'NotADirectoryError',
        'NotImplemented', 'NotImplementedError', 'OSError', 'OverflowError', 'PendingDeprecationWarning',
        'PermissionError', 'ProcessLookupError', 'RecursionError', 'ReferenceError',
        'ResourceWarning', 'RuntimeError', 'RuntimeWarning', 'StopAsyncIteration',
        'StopIteration', 'SyntaxError', 'SyntaxWarning', 'SystemError', 'SystemExit',
        'TabError', 'TimeoutError', 'TypeError', 'UnboundLocalError', 'UnicodeDecodeError',
        'UnicodeEncodeError', 'UnicodeError', 'UnicodeTranslateError', 'UnicodeWarning',
        'UserWarning', 'ValueError', 'Warning', 'ZeroDivisionError'
    ]);

    // Remove comments and strings to avoid false positives
    let cleanedCode = removeCommentsAndStrings(pythonCode);
    
    // Find user-defined functions first (functions defined in this file)
    const userDefinedFunctions = findUserDefinedFunctions(cleanedCode);
    
    // Find variables from assignments and other contexts
    const variables = findVariables(cleanedCode);
    
    // Find import aliases
    const importAliases = findImportAliases(cleanedCode);
    
    // Combine all identifiers
    userDefinedFunctions.forEach(id => identifiers.add(id));
    variables.forEach(id => identifiers.add(id));
    importAliases.forEach(id => identifiers.add(id));
    
    // Filter out builtins and likely library functions
    const filteredIdentifiers = Array.from(identifiers).filter(identifier => {
        return !builtins.has(identifier) && !isLikelyBuiltin(identifier);
    });
    
    return filteredIdentifiers;
}

function findUserDefinedFunctions(code: string): Set<string> {
    const functions = new Set<string>();
    
    // Match function definitions: def function_name(
    const functionPattern = /^\s*def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gm;
    
    let match;
    while ((match = functionPattern.exec(code)) !== null) {
        functions.add(match[1]);
    }
    
    return functions;
}

function findVariables(code: string): Set<string> {
    const variables = new Set<string>();
    
    // Pattern for various assignment contexts
    const patterns = [
        // Simple assignment: x = 1
        /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/gm,
        
        // Multiple assignment: x, y = 1, 2 or x, y, z = func()
        /^\s*([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)+)\s*=/gm,
        
        // For loop variables: for x in range(10):
        /for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+in\s+/g,
        
        // For loop with multiple variables: for x, y in pairs:
        /for\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)+)\s+in\s+/g,
        
        // With statement variables: with open('file') as f:
        /with\s+.+\s+as\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
        
        // Class definitions: class MyClass:
        /^\s*class\s+([a-zA-Z_][a-zA-Z0-9_]*)/gm,
        
        // Exception handling: except Exception as e:
        /except\s+.+\s+as\s+([a-zA-Z_][a-zA-Z0-9_]*)/g
    ];
    
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(code)) !== null) {
            const matched = match[1];
            
            // Handle multiple variables (x, y, z)
            if (matched.includes(',')) {
                const vars = matched.split(',').map(v => v.trim());
                vars.forEach(v => {
                    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(v)) {
                        variables.add(v);
                    }
                });
            } else {
                variables.add(matched);
            }
        }
    });
    
    return variables;
}

function findImportAliases(code: string): Set<string> {
    const aliases = new Set<string>();
    
    // Match import aliases: import module as alias
    const importAsPattern = /import\s+[a-zA-Z_][a-zA-Z0-9_.]*\s+as\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    
    // Match from import aliases: from module import name as alias
    const fromImportAsPattern = /from\s+[a-zA-Z_][a-zA-Z0-9_.]*\s+import\s+.+\s+as\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    
    let match;
    
    // Find import aliases
    while ((match = importAsPattern.exec(code)) !== null) {
        aliases.add(match[1]);
    }
    
    // Find from import aliases
    while ((match = fromImportAsPattern.exec(code)) !== null) {
        aliases.add(match[1]);
    }
    
    return aliases;
}

function removeCommentsAndStrings(code: string): string {
    let result = '';
    let i = 0;
    
    while (i < code.length) {
        const char = code[i];
        const nextChar = i + 1 < code.length ? code[i + 1] : '';
        
        // Handle triple-quoted strings
        if (char === '"' || char === "'") {
            const quote = char;
            if (code.substr(i, 3) === quote.repeat(3)) {
                // Skip triple-quoted string
                i += 3;
                while (i < code.length - 2) {
                    if (code.substr(i, 3) === quote.repeat(3)) {
                        i += 3;
                        break;
                    }
                    i++;
                }
                continue;
            } else {
                // Skip regular string
                i++;
                while (i < code.length && code[i] !== quote) {
                    if (code[i] === '\\') {
                        i += 2; // Skip escaped character
                    } else {
                        i++;
                    }
                }
                if (i < code.length) i++; // Skip closing quote
                continue;
            }
        }
        
        // Handle comments
        if (char === '#') {
            // Skip until end of line
            while (i < code.length && code[i] !== '\n') {
                i++;
            }
            if (i < code.length) {
                result += '\n'; // Preserve line breaks
                i++;
            }
            continue;
        }
        
        result += char;
        i++;
    }
    
    return result;
}

function isLikelyBuiltin(identifier: string): boolean {
    // Additional heuristics to filter out likely built-ins or library functions
    
    // Common patterns for built-ins or library functions
    const patterns = [
        /^__.*__$/, // Dunder methods
        /^_[A-Z]/, // Private constants
        /^[A-Z][A-Z_]+$/, // Constants (all caps)
    ];
    
    for (const pattern of patterns) {
        if (pattern.test(identifier)) {
            return true;
        }
    }
    
    // Common library prefixes/suffixes
    const commonLibraryParts = [
        'os', 'sys', 'json', 'math', 'random', 'time', 'datetime', 're', 'collections',
        'itertools', 'functools', 'operator', 'pathlib', 'urllib', 'http', 'socket',
        'threading', 'multiprocessing', 'subprocess', 'pickle', 'csv', 'xml', 'html',
        'numpy', 'np', 'pandas', 'pd', 'matplotlib', 'plt', 'scipy', 'sklearn',
        'torch', 'tf', 'cv2', 'PIL', 'requests', 'flask', 'django', 'fastapi'
    ];
    
    const lowerIdentifier = identifier.toLowerCase();
    for (const part of commonLibraryParts) {
        if (lowerIdentifier.includes(part)) {
            return true;
        }
    }
    
    return false;
}