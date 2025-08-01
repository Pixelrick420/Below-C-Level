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
    
    // Find user-defined import aliases (only "as" aliases, not regular imports)
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
    // Use word boundaries and better whitespace handling
    const functionPattern = /(?:^|\n)\s*def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    
    let match;
    while ((match = functionPattern.exec(code)) !== null) {
        functions.add(match[1]);
    }
    
    return functions;
}

function findVariables(code: string): Set<string> {
    const variables = new Set<string>();
    
    // Split code into lines to handle indentation-based parsing better
    const lines = code.split('\n');
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;
        
        // ANY assignment pattern - captures ALL user variables being assigned
        // This includes: result = numpy.array(), x = 5, my_var = func(), etc.
        const assignmentPattern = /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=/;
        let match = assignmentPattern.exec(trimmedLine);
        if (match) {
            const varName = match[2];
            // Don't skip any user-defined variable names
            variables.add(varName);
            continue;
        }
        
        // Multiple assignment: x, y = 1, 2 or x, y, z = func()
        const multipleAssignment = /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)+)\s*=/;
        match = multipleAssignment.exec(trimmedLine);
        if (match) {
            const vars = match[2].split(',').map(v => v.trim());
            vars.forEach(v => {
                if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(v)) {
                    variables.add(v);
                }
            });
            continue;
        }
        
        // For loop variables: for x in range(10):
        const forLoop = /^(\s*)for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+in\s+/;
        match = forLoop.exec(trimmedLine);
        if (match) {
            variables.add(match[2]);
            continue;
        }
        
        // For loop with multiple variables: for x, y in pairs:
        const forLoopMultiple = /^(\s*)for\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)+)\s+in\s+/;
        match = forLoopMultiple.exec(trimmedLine);
        if (match) {
            const vars = match[2].split(',').map(v => v.trim());
            vars.forEach(v => {
                if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(v)) {
                    variables.add(v);
                }
            });
            continue;
        }
        
        // With statement variables: with open('file') as f:
        const withStatement = /^(\s*)with\s+.+\s+as\s+([a-zA-Z_][a-zA-Z0-9_]*)/;
        match = withStatement.exec(trimmedLine);
        if (match) {
            variables.add(match[2]);
            continue;
        }
        
        // Class definitions: class MyClass:
        const classDefinition = /^(\s*)class\s+([a-zA-Z_][a-zA-Z0-9_]*)/;
        match = classDefinition.exec(trimmedLine);
        if (match) {
            variables.add(match[2]);
            continue;
        }
        
        // Exception handling: except Exception as e:
        const exceptionHandling = /^(\s*)except\s+.+\s+as\s+([a-zA-Z_][a-zA-Z0-9_]*)/;
        match = exceptionHandling.exec(trimmedLine);
        if (match) {
            variables.add(match[2]);
            continue;
        }
        
        // Lambda assignments: func = lambda x: x + 1
        const lambdaAssignment = /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*lambda/;
        match = lambdaAssignment.exec(trimmedLine);
        if (match) {
            variables.add(match[2]);
            continue;
        }
        
        // Function parameters in lambda: lambda x, y: x + y
        const lambdaParams = /lambda\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*)\s*:/;
        match = lambdaParams.exec(line);
        if (match) {
            const params = match[1].split(',').map(p => p.trim());
            params.forEach(p => {
                if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(p)) {
                    variables.add(p);
                }
            });
        }
    }
    
    // Also find function parameters from function definitions
    const functionParams = /def\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(([^)]*)\)/g;
    let match;
    while ((match = functionParams.exec(code)) !== null) {
        const params = match[1];
        if (params.trim()) {
            // Split by comma and extract parameter names
            const paramList = params.split(',');
            for (const param of paramList) {
                const cleanParam = param.trim();
                // Handle default parameters: x=5, *args, **kwargs
                const paramMatch = cleanParam.match(/^(\*{0,2})([a-zA-Z_][a-zA-Z0-9_]*)/);
                if (paramMatch && paramMatch[2] !== 'self') { // Skip 'self' parameter
                    variables.add(paramMatch[2]);
                }
            }
        }
    }
    
    return variables;
}

function findImportAliases(code: string): Set<string> {
    const aliases = new Set<string>();
    
    // ONLY find user-defined aliases with "as" keyword
    // These are safe to change because they're user-created names
    
    // Match import aliases: import module as alias
    const importAsPattern = /import\s+[a-zA-Z_][a-zA-Z0-9_.]*\s+as\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    
    // Match from import aliases: from module import name as alias
    const fromImportAsPattern = /from\s+[a-zA-Z_][a-zA-Z0-9_.]*\s+import\s+[^,\n]+\s+as\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    
    let match;
    
    // Find import aliases - these are user-defined names
    while ((match = importAsPattern.exec(code)) !== null) {
        aliases.add(match[1]);
    }
    
    // Find from import aliases - these are user-defined names
    while ((match = fromImportAsPattern.exec(code)) !== null) {
        aliases.add(match[1]);
    }
    
    // DO NOT include regular imports like "import numpy" because:
    // - "numpy" is the actual module name, changing it breaks the code
    // - Same for "from math import sin" - "sin" is the actual function name
    
    return aliases;
}

function removeCommentsAndStrings(code: string): string {
    let result = '';
    let i = 0;
    
    while (i < code.length) {
        const char = code[i];
        
        // Handle triple-quoted strings (docstrings)
        if ((char === '"' || char === "'") && i + 2 < code.length) {
            const quote = char;
            if (code.substr(i, 3) === quote.repeat(3)) {
                // Skip triple-quoted string
                i += 3;
                while (i <= code.length - 3) {
                    if (code.substr(i, 3) === quote.repeat(3)) {
                        i += 3;
                        break;
                    }
                    if (code[i] === '\n') {
                        result += '\n'; // Preserve line breaks for line-based parsing
                    }
                    i++;
                }
                continue;
            }
        }
        
        // Handle regular strings
        if (char === '"' || char === "'") {
            const quote = char;
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
    // If it's already a shakespearean insult (contains underscores and looks like our format)
    // then it's a user identifier that was previously transformed - DON'T filter it out
    if (identifier.includes('_') && identifier.split('_').length === 3) {
        // Check if it matches our shakespearean pattern (three parts separated by underscores)
        const parts = identifier.split('_');
        if (parts.length === 3 && parts.every(part => /^[a-zA-Z]+$/.test(part))) {
            return false; // Don't filter out - this is likely a transformed identifier
        }
    }
    
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
    
    // Common library prefixes/suffixes - but exclude already transformed identifiers
    const commonLibraryParts = [
        'os', 'sys', 'json', 'math', 'random', 'time', 'datetime', 're', 'collections',
        'itertools', 'functools', 'operator', 'pathlib', 'urllib', 'http', 'socket',
        'threading', 'multiprocessing', 'subprocess', 'pickle', 'csv', 'xml', 'html',
        'numpy', 'np', 'pandas', 'pd', 'matplotlib', 'plt', 'scipy', 'sklearn',
        'torch', 'tf', 'cv2', 'PIL', 'requests', 'flask', 'django', 'fastapi'
    ];
    
    const lowerIdentifier = identifier.toLowerCase();
    for (const part of commonLibraryParts) {
        if (lowerIdentifier === part || lowerIdentifier.includes(part)) {
            return true;
        }
    }
    
    return false;
}