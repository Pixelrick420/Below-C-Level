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

    // Simple regex-based approach to find identifiers
    // This is not a full parser but should work for most cases
    
    // Remove comments and strings to avoid false positives
    let cleanedCode = removeCommentsAndStrings(pythonCode);
    
    // Pattern to match Python identifiers
    const identifierPattern = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
    
    let match;
    while ((match = identifierPattern.exec(cleanedCode)) !== null) {
        const identifier = match[0];
        
        // Skip if it's a builtin or keyword
        if (!builtins.has(identifier)) {
            // Additional checks to filter out likely non-user-defined identifiers
            if (!isLikelyBuiltin(identifier)) {
                identifiers.add(identifier);
            }
        }
    }
    
    return Array.from(identifiers);
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