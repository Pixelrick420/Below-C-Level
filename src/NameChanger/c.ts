export function getIdentifiers(cCode: string): string[] {
    const identifiers = new Set<string>();
    
    // C keywords and standard library functions to exclude
    const builtins = new Set([
        // C keywords
        'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
        'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
        'inline', 'int', 'long', 'register', 'restrict', 'return', 'short',
        'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union',
        'unsigned', 'void', 'volatile', 'while', '_Bool', '_Complex', '_Imaginary',
        
        // C99/C11 keywords
        '_Alignas', '_Alignof', '_Atomic', '_Static_assert', '_Noreturn',
        '_Thread_local', '_Generic',
        
        // Common standard library functions
        'printf', 'scanf', 'puts', 'gets', 'putchar', 'getchar', 'fopen', 'fclose',
        'fread', 'fwrite', 'fprintf', 'fscanf', 'fgets', 'fputs', 'fgetc', 'fputc',
        'malloc', 'calloc', 'realloc', 'free', 'strlen', 'strcpy', 'strncpy',
        'strcat', 'strncat', 'strcmp', 'strncmp', 'strchr', 'strrchr', 'strstr',
        'strtok', 'memcpy', 'memmove', 'memset', 'memcmp', 'atoi', 'atof', 'atol',
        'strtol', 'strtod', 'abs', 'labs', 'div', 'ldiv', 'rand', 'srand',
        'exit', 'abort', 'atexit', 'system', 'getenv', 'qsort', 'bsearch',
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'sinh', 'cosh', 'tanh',
        'exp', 'log', 'log10', 'pow', 'sqrt', 'ceil', 'floor', 'fabs', 'ldexp',
        'frexp', 'modf', 'fmod', 'time', 'clock', 'difftime', 'mktime',
        'asctime', 'ctime', 'gmtime', 'localtime', 'strftime', 'isalnum', 'isalpha',
        'iscntrl', 'isdigit', 'isgraph', 'islower', 'isprint', 'ispunct', 'isspace',
        'isupper', 'isxdigit', 'tolower', 'toupper', 'setjmp', 'longjmp',
        
        // Common type names
        'size_t', 'ptrdiff_t', 'wchar_t', 'FILE', 'fpos_t', 'clock_t', 'time_t',
        'va_list', 'jmp_buf', 'sig_atomic_t', 'div_t', 'ldiv_t',
        
        // Common constants
        'NULL', 'EOF', 'SEEK_SET', 'SEEK_CUR', 'SEEK_END', 'FILENAME_MAX',
        'FOPEN_MAX', 'RAND_MAX', 'EXIT_SUCCESS', 'EXIT_FAILURE', 'CLOCKS_PER_SEC'
    ]);

    // Remove comments and strings to avoid false positives
    let cleanedCode = removeCommentsAndStrings(cCode);
    
    // Find user-defined functions
    const userDefinedFunctions = findUserDefinedFunctions(cleanedCode);
    
    // Find variables from declarations and other contexts
    const variables = findVariables(cleanedCode);
    
    // Find typedefs and struct/enum names
    const userTypes = findUserTypes(cleanedCode);
    
    // Combine all identifiers
    userDefinedFunctions.forEach(id => identifiers.add(id));
    variables.forEach(id => identifiers.add(id));
    userTypes.forEach(id => identifiers.add(id));
    
    // Filter out builtins and likely library functions
    const filteredIdentifiers = Array.from(identifiers).filter(identifier => {
        return !builtins.has(identifier) && !isLikelyBuiltin(identifier);
    });
    
    return filteredIdentifiers;
}

function findUserDefinedFunctions(code: string): Set<string> {
    const functions = new Set<string>();
    
    // Match function definitions with various return types
    // Pattern: [return_type] function_name(parameters) {
    const functionPattern = /(?:^|\n)\s*(?:static\s+|extern\s+|inline\s+)*(?:unsigned\s+|signed\s+)*(?:const\s+|volatile\s+)*(?:void|char|short|int|long|float|double|[a-zA-Z_][a-zA-Z0-9_]*)\s*\*?\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*(?:\{|;)/g;
    
    let match;
    while ((match = functionPattern.exec(code)) !== null) {
        const funcName = match[1];
        // Skip if it looks like a variable declaration or if it's main
        if (funcName !== 'main' && !isVariableDeclaration(match[0])) {
            functions.add(funcName);
        }
    }
    
    return functions;
}

function findVariables(code: string): Set<string> {
    const variables = new Set<string>();
    
    // Match variable declarations
    // Pattern: type variable_name = value; or type variable_name;
    const variablePatterns = [
        // Simple declarations: int x; float y = 1.0;
        /(?:^|\n|\{|;)\s*(?:static\s+|extern\s+|auto\s+|register\s+)*(?:unsigned\s+|signed\s+)*(?:const\s+|volatile\s+)*(?:void|char|short|int|long|float|double|[a-zA-Z_][a-zA-Z0-9_]*)\s*\*?\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:=|;|,)/g,
        
        // Array declarations: int arr[10];
        /(?:^|\n|\{|;)\s*(?:static\s+|extern\s+|auto\s+|register\s+)*(?:unsigned\s+|signed\s+)*(?:const\s+|volatile\s+)*(?:void|char|short|int|long|float|double|[a-zA-Z_][a-zA-Z0-9_]*)\s*\*?\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\[/g,
        
        // Pointer declarations: int *ptr;
        /(?:^|\n|\{|;)\s*(?:static\s+|extern\s+|auto\s+|register\s+)*(?:unsigned\s+|signed\s+)*(?:const\s+|volatile\s+)*(?:void|char|short|int|long|float|double|[a-zA-Z_][a-zA-Z0-9_]*)\s*\*+\s*([a-zA-Z_][a-zA-Z0-9_]*)/g,
        
        // For loop variables: for(int i = 0; ...)
        /for\s*\(\s*(?:int|char|float|double|long|short|unsigned|signed)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
        
        // Function parameters (from function definitions)
        /\(\s*(?:[^)]*,\s*)*(?:const\s+|volatile\s+)*(?:unsigned\s+|signed\s+)*(?:void|char|short|int|long|float|double|[a-zA-Z_][a-zA-Z0-9_]*)\s*\*?\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:,|\))/g
    ];
    
    variablePatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(code)) !== null) {
            const varName = match[1];
            if (varName && !isKeywordOrBuiltin(varName)) {
                variables.add(varName);
            }
        }
    });
    
    return variables;
}

function findUserTypes(code: string): Set<string> {
    const types = new Set<string>();
    
    // Match typedef declarations: typedef ... newType;
    const typedefPattern = /typedef\s+(?:[^;]+\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*;/g;
    
    // Match struct definitions: struct StructName { ... };
    const structPattern = /struct\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\{/g;
    
    // Match enum definitions: enum EnumName { ... };
    const enumPattern = /enum\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\{/g;
    
    // Match union definitions: union UnionName { ... };
    const unionPattern = /union\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\{/g;
    
    const patterns = [typedefPattern, structPattern, enumPattern, unionPattern];
    
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(code)) !== null) {
            types.add(match[1]);
        }
    });
    
    return types;
}

function removeCommentsAndStrings(code: string): string {
    let result = '';
    let i = 0;
    
    while (i < code.length) {
        const char = code[i];
        const nextChar = i + 1 < code.length ? code[i + 1] : '';
        
        // Handle single-line comments: //
        if (char === '/' && nextChar === '/') {
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
        
        // Handle multi-line comments: /* */
        if (char === '/' && nextChar === '*') {
            i += 2;
            while (i < code.length - 1) {
                if (code[i] === '*' && code[i + 1] === '/') {
                    i += 2;
                    break;
                }
                if (code[i] === '\n') {
                    result += '\n'; // Preserve line breaks
                }
                i++;
            }
            continue;
        }
        
        // Handle character literals: 'c' or '\n'
        if (char === "'") {
            i++;
            if (i < code.length && code[i] === '\\') {
                i += 2; // Skip escaped character
            } else if (i < code.length) {
                i++; // Skip regular character
            }
            if (i < code.length && code[i] === "'") {
                i++; // Skip closing quote
            }
            continue;
        }
        
        // Handle string literals: "string"
        if (char === '"') {
            i++;
            while (i < code.length && code[i] !== '"') {
                if (code[i] === '\\') {
                    i += 2; // Skip escaped character
                } else {
                    i++;
                }
            }
            if (i < code.length) i++; // Skip closing quote
            continue;
        }
        
        result += char;
        i++;
    }
    
    return result;
}

function isVariableDeclaration(declaration: string): boolean {
    // Check if this looks more like a variable declaration than a function
    // Functions usually have parameters and/or opening brace
    return !declaration.includes('(') || declaration.includes('=');
}

function isKeywordOrBuiltin(identifier: string): boolean {
    const keywords = new Set([
        'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
        'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
        'inline', 'int', 'long', 'register', 'restrict', 'return', 'short',
        'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union',
        'unsigned', 'void', 'volatile', 'while'
    ]);
    
    return keywords.has(identifier);
}

function isLikelyBuiltin(identifier: string): boolean {
    // Patterns that suggest built-in or library functions
    const patterns = [
        /^_[A-Z]/, // Private constants like _MAX_PATH
        /^[A-Z][A-Z_]+$/, // All caps constants like MAX_SIZE
        /^__.*__$/, // Dunder-style identifiers
        /^_[a-z]/, // Leading underscore with lowercase (reserved)
    ];
    
    for (const pattern of patterns) {
        if (pattern.test(identifier)) {
            return true;
        }
    }
    
    // Common library prefixes
    const libraryPrefixes = [
        'std', 'str', 'mem', 'io', 'file', 'printf', 'scanf', 'get', 'put',
        'is', 'to', 'pthread', 'win32', 'posix'
    ];
    
    const lowerIdentifier = identifier.toLowerCase();
    for (const prefix of libraryPrefixes) {
        if (lowerIdentifier.startsWith(prefix)) {
            return true;
        }
    }
    
    return false;
}