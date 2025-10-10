/* Theme toggle logic */
(function(){
  const html = document.documentElement;
  const opts = document.querySelectorAll('.theme-opt');
  const THEME_STORAGE_KEY = 'chem-typer-theme';
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  const apply = (mode)=>{
    opts.forEach(o=>o.classList.toggle('is-active', o.dataset.theme===mode));
    const resolved = mode === 'system' ? (prefersDarkScheme.matches ? 'dark' : 'light') : mode;
    html.setAttribute('data-theme', resolved); 
    html.style.colorScheme = resolved === 'dark' ? 'dark' : 'light';
    localStorage.setItem(THEME_STORAGE_KEY, mode); 
  };
  
  // Initialize - default to system
  const saved = localStorage.getItem(THEME_STORAGE_KEY) || 'system';
  apply(saved);
  
  // Bind click handlers
  opts.forEach(btn => btn.addEventListener('click', ()=> apply(btn.dataset.theme)));
  
  // Listen for system theme changes
  const handleSystemChange = () => {
    const current = localStorage.getItem(THEME_STORAGE_KEY) || 'system';
    if(current === 'system'){ apply('system'); }
  };
  if(typeof prefersDarkScheme.addEventListener === 'function'){
    prefersDarkScheme.addEventListener('change', handleSystemChange);
  } else if(typeof prefersDarkScheme.addListener === 'function'){
    prefersDarkScheme.addListener(handleSystemChange);
  }
})();

/* Initialize Lucide icons */
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
});

const mathField = document.getElementById('mf');
const textArea = document.getElementById('ta');
const wordOutput = document.getElementById('wordOut');
const previewDiv = document.getElementById('preview');
const statusDiv = document.getElementById('status');

// Store raw LaTeX WITH \! for word equation generation
let rawLatex = '';

function showToast(message = 'Copied!') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._timeout);
  showToast._timeout = setTimeout(() => toast.classList.remove('show'), 1600);
}

async function copyToClipboard(text, label = 'text') {
  let success = false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      success = true;
    }
  } catch (err) {
    success = false;
  }

  if (!success) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      success = document.execCommand('copy');
    } catch (err) {
      success = false;
    }
    document.body.removeChild(textarea);
  }

  if (statusDiv) {
    statusDiv.textContent = success ? `Copied ${label} ✓` : `Copy ${label} failed`;
  }
  showToast(success ? `Copied ${label} ✓` : 'Copy failed');
}

function typesetMath(){ 
  if(window.MathJax) {
    try {
      window.MathJax.typesetPromise([previewDiv]);
    } catch(e) {
      console.warn('MathJax typeset failed', e);
    }
  }
}

// ============================================================================
// AST-BASED LATEX → WORD UNICODEMATH CONVERTER
// ============================================================================

/**
 * Tokenizer: Splits LaTeX into structured tokens
 */
function tokenizeLatex(latex) {
    const tokens = [];
    let i = 0;
    const len = latex.length;
    
    while (i < len) {
        const ch = latex[i];
        
        // Skip whitespace
        if (/\s/.test(ch)) {
            i++;
            continue;
        }
        
        // LaTeX commands
        if (ch === '\\') {
            const start = i;
            i++; // skip '\'
            
            // Check for special single-character spacing commands
            if (i < len && /[,:;! ]/.test(latex[i])) {
                i++; // Include the spacing character
                const cmd = latex.substring(start, i);
                tokens.push({ type: 'command', value: cmd, args: [] });
                continue;
            }
            
            // Read alphabetic command name
            while (i < len && /[a-zA-Z]/.test(latex[i])) {
                i++;
            }
            
            const cmd = latex.substring(start, i);
            
            // Handle command arguments
            let args = [];
            while (i < len && latex[i] === '{') {
                let depth = 0;
                const argStart = i;
                while (i < len) {
                    if (latex[i] === '{') depth++;
                    if (latex[i] === '}') {
                        depth--;
                        if (depth === 0) {
                            i++;
                            break;
                        }
                    }
                    i++;
                }
                args.push(latex.substring(argStart + 1, i - 1));
            }
            
            tokens.push({ type: 'command', value: cmd, args });
                continue;
            }
        
        // Braces
        if (ch === '{') {
            tokens.push({ type: 'lbrace' });
            i++;
                continue;
            }
        if (ch === '}') {
            tokens.push({ type: 'rbrace' });
            i++;
            continue;
        }
        
        // Subscript
        if (ch === '_') {
            tokens.push({ type: 'subscript' });
            i++;
            continue;
        }
        
        // Superscript
        if (ch === '^') {
            tokens.push({ type: 'superscript' });
            i++;
                continue;
            }
        
        // Plus sign
        if (ch === '+') {
            tokens.push({ type: 'plus' });
            i++;
                continue;
            }
        
        // Parentheses
        if (ch === '(') {
            tokens.push({ type: 'lparen' });
            i++;
                continue;
            }
        if (ch === ')') {
            tokens.push({ type: 'rparen' });
            i++;
            continue;
        }
        
        // Numbers
        if (/[0-9]/.test(ch)) {
            const start = i;
            while (i < len && /[0-9]/.test(latex[i])) {
                i++;
            }
            tokens.push({ type: 'number', value: latex.substring(start, i) });
            continue;
        }
        
        // Letters (elements, variables)
        if (/[A-Za-z]/.test(ch)) {
            const start = i;
            // Read capital letter optionally followed by lowercase
            i++;
            if (i < len && /[a-z]/.test(latex[i]) && /[A-Z]/.test(latex[start])) {
                    i++;
                }
            tokens.push({ type: 'element', value: latex.substring(start, i) });
            continue;
        }
        
        // Greek letters and symbols (already converted)
        if (/[α-ωΑ-Ω]/.test(ch)) {
            tokens.push({ type: 'symbol', value: ch });
            i++;
            continue;
        }
        
        // Arrows and other special symbols
        if ('→←↔⇌⇒⇐±×·÷∞∂∇∫∑∏'.includes(ch)) {
            tokens.push({ type: 'symbol', value: ch });
            i++;
            continue;
        }
        
        // Other characters
        tokens.push({ type: 'char', value: ch });
        i++;
    }
    
    return tokens;
}

/**
 * AST Node types
 */
class ASTNode {
    constructor(type, value = null) {
        this.type = type;
        this.value = value;
        this.children = [];
        this.subscript = null;
        this.superscript = null;
    }
    
    addChild(node) {
        this.children.push(node);
        return this;
    }
}

/**
 * Parser: Converts tokens to AST
 */
function parseToAST(tokens) {
    let pos = 0;
    
    function peek() {
        return tokens[pos];
    }
    
    function consume() {
        return tokens[pos++];
    }
    
    function parseGroup() {
        const node = new ASTNode('group');
        
        while (pos < tokens.length) {
            const token = peek();
            
            if (!token || token.type === 'rbrace') {
                break;
            }
            
            node.addChild(parseExpression());
        }
        
        return node;
    }
    
    function parseExpression() {
        const token = consume();
        
        if (!token) return null;
        
        // Handle commands
        if (token.type === 'command') {
            return parseCommand(token);
        }
        
        // Handle grouped expressions
        if (token.type === 'lbrace') {
            const group = parseGroup();
            consume(); // consume '}'
            return group;
        }
        
        // Special case: isotope notation ^{mass}_{atomic}Element
        // If we start with superscript, look ahead for subscript and element
        if (token.type === 'superscript') {
            const superscript = parseScriptArg();
            let subscript = null;
            let baseElement = null;
            
            // Check for following subscript
            if (peek() && peek().type === 'subscript') {
                consume(); // consume '_'
                subscript = parseScriptArg();
            }
            
            // Check for following element (direct or wrapped in braces)
            let nextToken = peek();
            if (nextToken && nextToken.type === 'element') {
                const elemToken = consume();
                // Build explicit isotope node for consistent downstream handling
                baseElement = new ASTNode('isotope', elemToken.value);
                baseElement.superscript = superscript;
                baseElement.subscript = subscript;
                return baseElement;
            } else if (nextToken && nextToken.type === 'lbrace') {
                // Peek ahead to see if the group contains a single element
                const savedPos = pos;
                consume(); // consume '{'
                const innerToken = peek();
                const afterInner = tokens[pos + 1];
                
                if (innerToken && innerToken.type === 'element' && 
                    afterInner && afterInner.type === 'rbrace') {
                    // It's {Element} - extract it
                    const elemToken = consume();
                    consume(); // consume '}'
                    baseElement = new ASTNode('isotope', elemToken.value);
                    baseElement.superscript = superscript;
                    baseElement.subscript = subscript;
                    return baseElement;
                } else {
                    // Not a simple {Element}, restore position
                    pos = savedPos;
                }
            }
            
            // If no element follows, treat as regular pattern (shouldn't happen in isotope notation)
            const node = new ASTNode('char', '');
            node.superscript = superscript;
            if (subscript) node.subscript = subscript;
            return node;
        }

        // Special case: isotope notation _{atomic}^{mass}Element
        // If we start with subscript, look ahead for superscript and element
        if (token.type === 'subscript') {
            const subscript = parseScriptArg();
            let superscript = null;
            let baseElement = null;

            // Check for following superscript
            if (peek() && peek().type === 'superscript') {
                consume(); // consume '^'
                superscript = parseScriptArg();
            }

            // Check for following element (direct or wrapped in braces)
            let nextToken = peek();
            if (nextToken && nextToken.type === 'element') {
                const elemToken = consume();
                // Build explicit isotope node for consistent downstream handling
                baseElement = new ASTNode('isotope', elemToken.value);
                baseElement.subscript = subscript;
                baseElement.superscript = superscript;
                return baseElement;
            } else if (nextToken && nextToken.type === 'lbrace') {
                // Peek ahead to see if the group contains a single element
                const savedPos = pos;
                consume(); // consume '{'
                const innerToken = peek();
                const afterInner = tokens[pos + 1];
                
                if (innerToken && innerToken.type === 'element' && 
                    afterInner && afterInner.type === 'rbrace') {
                    // It's {Element} - extract it
                    const elemToken = consume();
                    consume(); // consume '}'
                    baseElement = new ASTNode('isotope', elemToken.value);
                    baseElement.subscript = subscript;
                    baseElement.superscript = superscript;
                    return baseElement;
                } else {
                    // Not a simple {Element}, restore position
                    pos = savedPos;
                }
            }

            // If no element follows, attach scripts to empty char node
            const node = new ASTNode('char', '');
            node.subscript = subscript;
            if (superscript) node.superscript = superscript;
            return node;
        }
        
        // Base node
        let node;
        if (token.type === 'element') {
            node = new ASTNode('element', token.value);
        } else if (token.type === 'number') {
            node = new ASTNode('number', token.value);
        } else if (token.type === 'symbol') {
            node = new ASTNode('symbol', token.value);
        } else if (token.type === 'char') {
            node = new ASTNode('char', token.value);
        } else if (token.type === 'plus') {
            node = new ASTNode('operator', '+');
        } else if (token.type === 'lparen') {
            node = new ASTNode('lparen', '(');
        } else if (token.type === 'rparen') {
            node = new ASTNode('rparen', ')');
                } else {
            node = new ASTNode('unknown', token.value);
        }
        
        // Check for subscripts/superscripts
        while (pos < tokens.length) {
            const next = peek();
            
            if (next && next.type === 'subscript') {
                consume(); // consume '_'
                node.subscript = parseScriptArg();
            } else if (next && next.type === 'superscript') {
                consume(); // consume '^'
                node.superscript = parseScriptArg();
            } else {
                break;
            }
        }
        
        return node;
    }
    
    function parseScriptArg() {
        const token = peek();
        
        if (token && token.type === 'lbrace') {
            consume(); // consume '{'
            const group = parseGroup();
            consume(); // consume '}'
            return group;
        }
        
        // Single token
        return parseExpression();
    }
    
    function parseCommand(token) {
        const node = new ASTNode('command', token.value);
        node.args = token.args || [];
        return node;
    }
    
    // Parse all expressions
    const root = new ASTNode('root');
    while (pos < tokens.length) {
        const expr = parseExpression();
        if (expr) {
            root.addChild(expr);
        }
    }
    
    return root;
}

/**
 * AST → UnicodeMath converter
 */
function astToUnicodeMath(node, context = {}) {
    if (!node) return '';
    
    let result = '';
    
    switch (node.type) {
        case 'isotope':
            // Render grouped isotope notation: (_sub^sup)Element
            {
                // Get raw content from subscript and superscript
                let subContent = node.subscript ? astToUnicodeMath(node.subscript, context) : '';
                let supContent = node.superscript ? astToUnicodeMath(node.superscript, context) : '';
                
                // Remove outer parentheses if they exist (from group nodes)
                if (subContent.startsWith('(') && subContent.endsWith(')')) {
                    subContent = subContent.slice(1, -1);
                }
                if (supContent.startsWith('(') && supContent.endsWith(')')) {
                    supContent = supContent.slice(1, -1);
                }
                
                const elementSymbol = node.value || node.element || '';
                
                // Format: (_sub^sup)Element - note: no parentheses around sub/sup values
                result += `(_${subContent}^${supContent})`;
                
                // Preserve multi-letter element grouping if needed
                if (elementSymbol.length > 1) {
                    result += `〖${elementSymbol}〗`;
                } else {
                    result += elementSymbol;
                }
                break;
            }
        case 'root':
            for (const child of node.children) {
                result += astToUnicodeMath(child, context);
            }
            break;
            
        case 'group':
            // Groups in UnicodeMath are represented with parentheses
            result += '(';
            for (const child of node.children) {
                result += astToUnicodeMath(child, context);
            }
            result += ')';
            break;
            
        case 'element':
            // Check if both subscript and superscript exist (isotope notation)
            if (node.subscript && node.superscript) {
                // Prefer dedicated isotope node; but if element has both, render same shape
                let subContent = astToUnicodeMath(node.subscript, context);
                let supContent = astToUnicodeMath(node.superscript, context);
                
                // Remove outer parentheses if they exist (from group nodes)
                if (subContent.startsWith('(') && subContent.endsWith(')')) {
                    subContent = subContent.slice(1, -1);
                }
                if (supContent.startsWith('(') && supContent.endsWith(')')) {
                    supContent = supContent.slice(1, -1);
                }
                
                // Format: (_sub^sup)Element - note: no parentheses around sub/sup values
                result += `(_${subContent}^${supContent})`;
                if (node.value.length > 1) {
                    result += `〖${node.value}〗`;
                } else {
                    result += node.value;
                }
            } else {
                // Normal element notation
                // Multi-letter elements need grouping
                if (node.value.length > 1) {
                    result += `〖${node.value}〗`;
                } else {
                    result += node.value;
                }
                
                // Add subscript
                if (node.subscript) {
                    const subContent = astToUnicodeMath(node.subscript, context);
                    result += `_${subContent} `; // Space after subscript
                }
                
                // Add superscript
                if (node.superscript) {
                    const supContent = astToUnicodeMath(node.superscript, context);
                    result += `^(${supContent}) `; // Space after superscript
                }
            }
            break;
            
        case 'number':
            result += node.value;
            
            // Add subscript
            if (node.subscript) {
                const subContent = astToUnicodeMath(node.subscript, context);
                result += `_${subContent} `;
            }
            
            // Add superscript
            if (node.superscript) {
                const supContent = astToUnicodeMath(node.superscript, context);
                result += `^(${supContent}) `;
            }
            break;
            
        case 'symbol':
            result += node.value;
            
            // Add subscript/superscript for symbols
            if (node.subscript) {
                const subContent = astToUnicodeMath(node.subscript, context);
                result += `_${subContent} `;
            }
            if (node.superscript) {
                const supContent = astToUnicodeMath(node.superscript, context);
                result += `^(${supContent}) `;
            }
            break;
            
        case 'operator':
            result += ` ${node.value} `;
            break;
            
        case 'lparen':
            result += '(';
            break;
            
        case 'rparen':
            result += ')';
            break;
            
        case 'char':
            result += node.value;
            
            // Handle subscript/superscript on char nodes
            if (node.subscript) {
                const subContent = astToUnicodeMath(node.subscript, context);
                result += `_${subContent}`;
            }
            if (node.superscript) {
                const supContent = astToUnicodeMath(node.superscript, context);
                result += `^${supContent}`;
            }
            break;
            
        case 'command':
            result += processCommand(node, context);
            break;
            
        default:
            if (node.value) {
                result += node.value;
            }
    }
    
    return result;
}

/**
 * Process LaTeX commands
 */
function processCommand(node, context) {
    const cmd = node.value;
    const args = node.args || [];
    
    // Arrow commands
    if (cmd === '\\rightarrow' || cmd === '\\to') {
        return ' → ';
    }
    if (cmd === '\\leftarrow') {
        return ' ← ';
    }
    if (cmd === '\\leftrightarrow') {
        return ' ↔ ';
    }
    if (cmd === '\\rightleftharpoons' || cmd === '\\leftharpoons') {
        return ' ⇌ ';
    }
    if (cmd === '\\Rightarrow' || cmd === '\\implies') {
        return ' ⇒ ';
    }
    if (cmd === '\\Leftarrow') {
        return ' ⇐ ';
    }
    if (cmd === '\\Leftrightarrow' || cmd === '\\iff') {
        return ' ⇔ ';
    }
    
    // Labeled arrows
    if (cmd === '\\xrightarrow') {
        const label = args[0] ? cleanSegment(args[0]) : '';
        if (label) {
            return ` □(→┴${label} ) `;
        }
        return ' → ';
    }
    if (cmd === '\\xleftarrow') {
        const label = args[0] ? cleanSegment(args[0]) : '';
        if (label) {
            return ` □(←┴${label} ) `;
        }
        return ' ← ';
    }
    
    // Greek letters
    const greekMap = {
        '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ', '\\Delta': 'Δ',
        '\\epsilon': 'ε', '\\varepsilon': 'ε', '\\theta': 'θ', '\\Theta': 'Θ',
        '\\lambda': 'λ', '\\Lambda': 'Λ', '\\mu': 'μ', '\\pi': 'π', '\\Pi': 'Π',
        '\\sigma': 'σ', '\\Sigma': 'Σ', '\\phi': 'φ', '\\Phi': 'Φ', '\\omega': 'ω', '\\Omega': 'Ω'
    };
    if (greekMap[cmd]) {
        return greekMap[cmd];
    }
    
    // Spacing commands - convert to space in word equations
    if (cmd === '\\:' || cmd === '\\,' || cmd === '\\;' || cmd === '\\!' || cmd === '\\ ') {
        return ' ';
    }
    
    // Math operators
    if (cmd === '\\pm') return '±';
    if (cmd === '\\times') return '×';
    if (cmd === '\\cdot') return '·';
    if (cmd === '\\div') return '÷';
    
    // Fractions
    if (cmd === '\\frac') {
        const num = args[0] ? cleanSegment(args[0]) : '';
        const den = args[1] ? cleanSegment(args[1]) : '';
        return `${num}⁄${den}`;
    }
    
    // Square root
    if (cmd === '\\sqrt') {
        const content = args[0] ? cleanSegment(args[0]) : '';
        return `√(${content})`;
    }
    
    // Text commands
    if (cmd === '\\text' || cmd === '\\mathrm' || cmd === '\\operatorname') {
        return args[0] || '';
    }
    
    // Decorations
    if (cmd === '\\overline') {
        const content = args[0] ? cleanSegment(args[0]) : '';
        return `${content}̅`;
    }
    if (cmd === '\\bar') {
        const content = args[0] ? cleanSegment(args[0]) : '';
        return `${content}̄`;
    }
    if (cmd === '\\hat') {
        const content = args[0] ? cleanSegment(args[0]) : '';
        return `${content}̂`;
    }
    if (cmd === '\\tilde') {
        const content = args[0] ? cleanSegment(args[0]) : '';
        return `${content}̃`;
    }
    if (cmd === '\\vec') {
        const content = args[0] ? cleanSegment(args[0]) : '';
        return `${content}⃗`;
    }
    
    // Placeholder
    if (cmd === '\\placeholder') {
        return '□';
    }
    
    // Font commands
    if (cmd === '\\mathbb' || cmd === '\\mathcal' || cmd === '\\mathfrak') {
        return args[0] || '';
    }
    
    
    // Unknown command - return the name
    return cmd.substring(1); // Remove backslash
}

/**
 * Main conversion function using AST
 */
function toWordEquation(latex) {
    if (!latex || !latex.trim()) {
        return '';
    }
    
    // Pre-processing: clean up the LaTeX
    let processed = latex;
    
    // Handle common polyatomic ions - automatically add underscores for subscripts
    const polyatomicIons = {
        'NH4': 'NH_4',
        'SO4': 'SO_4',
        'SO3': 'SO_3',
        'NO3': 'NO_3',
        'NO2': 'NO_2',
        'CO3': 'CO_3',
        'PO4': 'PO_4',
        'ClO3': 'ClO_3',
        'ClO4': 'ClO_4',
        'MnO4': 'MnO_4',
        'CrO4': 'CrO_4',
        'Cr2O7': 'Cr_2O_7',
        'OH': 'OH',
        'CN': 'CN',
        'HCO3': 'HCO_3',
        'HSO4': 'HSO_4',
        'H2PO4': 'H_2PO_4',
        'HPO4': 'HPO_4',
        'C2H3O2': 'C_2H_3O_2',
        'CH3COO': 'CH_3COO'
    };
    
    // Replace polyatomic ions with proper subscript formatting
    // E.g., NH4 → NH_4, (NH4) → (NH_4), CuCO3 → CuCO_3
    for (let [ion, formatted] of Object.entries(polyatomicIons)) {
        // Escape special regex characters in the ion name
        const escapedIon = ion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Replace both with and without parentheses
        processed = processed.replace(
            new RegExp(`\\(${escapedIon}\\)`, 'g'),
            `(${formatted})`
        );
        // Match polyatomic ions even when preceded by element symbols
        // Only avoid matching if already has underscore or inside braces
        processed = processed.replace(
            new RegExp(`(?<!_)${escapedIon}(?![A-Za-z_{])`, 'g'),
            formatted
        );
    }
    
    // Handle state symbols - convert to inline parentheses
    processed = processed.replace(/_\{\\?\(?text\{(aq|s|l|g)\}\)?\}/gi, '((${1}))');
    processed = processed.replace(/_\{\\?\(?(aq|s|l|g)\)?\}/gi, '(($1))');
    
    // Tokenize
    const tokens = tokenizeLatex(processed);
    
    // Parse to AST
    const ast = parseToAST(tokens);
    
    // Convert to UnicodeMath
    let result = astToUnicodeMath(ast);
    
    // Post-processing
    result = postProcess(result);
    
    return result;
}

/**
 * Post-processing cleanup
 */
function postProcess(text) {
    // Replace state markers with proper format
    text = text.replace(/\(\((aq|s|l|g)\)\)/gi, (_, state) => `(${state.toLowerCase()})`);
    
    // Remove spaces before closing parentheses in isotope notation: (_6^(12) ) → (_6^(12))
    text = text.replace(/\s+\)/g, ')');
    
    // Ensure space before opening parenthesis for states
    text = text.replace(/([A-Za-z0-9〗])\s*\(([aslg])\)/g, '$1 ($2)');
    
    // Clean up space before operators
    text = text.replace(/\s+([+])\s+/g, ' $1 ');
    
    // Trim
    text = text.trim();
    
    return text;
}

/**
 * Legacy cleanSegment function for command arguments
 */
function cleanSegment(segment, depth = 0) {
    if (depth > 5) return segment || '';
    
    let text = String(segment || '').trim();
    if (!text) return '';
    
    // Remove braces
    text = text.replace(/[{}]/g, '');
    
    // Process nested LaTeX
    const tokens = tokenizeLatex(text);
    const ast = parseToAST(tokens);
    text = astToUnicodeMath(ast);
    
    return text.trim();
}

// Helper function to convert polyatomic ions to LaTeX format
function convertPolyatomicIons(text) {
  let val = text;
  
  // Common polyatomic ions mapping
  const polyatomicIons = {
    'NH4': 'NH_{4}',
    'SO4': 'SO_{4}',
    'SO3': 'SO_{3}',
    'NO3': 'NO_{3}',
    'NO2': 'NO_{2}',
    'CO3': 'CO_{3}',
    'PO4': 'PO_{4}',
    'ClO3': 'ClO_{3}',
    'ClO4': 'ClO_{4}',
    'MnO4': 'MnO_{4}',
    'CrO4': 'CrO_{4}',
    'Cr2O7': 'Cr_{2}O_{7}',
    'OH': 'OH',
    'CN': 'CN',
    'HCO3': 'HCO_{3}',
    'HSO4': 'HSO_{4}',
    'H2PO4': 'H_{2}PO_{4}',
    'HPO4': 'HPO_{4}',
    'C2H3O2': 'C_{2}H_{3}O_{2}',
    'CH3COO': 'CH_{3}COO'
  };
  
  // Replace polyatomic ions with proper LaTeX subscript formatting
  // E.g., NH4 → NH_{4}, (NH4) → (NH_{4})
  for (let [ion, formatted] of Object.entries(polyatomicIons)) {
    // Skip if already formatted (avoid double conversion)
    if (val.includes(formatted)) {
      continue;
    }
    
    // Escape special regex characters in the ion name
    const escapedIon = ion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Replace with parentheses first: (NH4) → (NH_{4})
    val = val.replace(
      new RegExp(`\\(${escapedIon}\\)`, 'g'),
      `(${formatted})`
    );
    
    // Replace without parentheses, even when preceded by element symbols (e.g., CuCO3 → CuCO_{3})
    // Only avoid matching if already has underscore/braces or followed by letters
    val = val.replace(
      new RegExp(`(?<!_)${escapedIon}(?![A-Za-z_{])`, 'g'),
      formatted
    );
  }
  
  return val;
}

function syncFromMath(){
  let val = mathField.getValue('latex') || '';
  
  // Convert polyatomic ions
  val = convertPolyatomicIons(val);
  
  // Store raw version WITH \!
  rawLatex = val;
  
  // Display version WITHOUT \! in text area
  textArea.value = val.replace(/\\!/g, '');
  
  // Generate word equation from version WITH \!
  wordOutput.value = toWordEquation(rawLatex);
  
  // Preview also WITHOUT \!
  const previewVal = val.replace(/\\!/g, '');
  previewDiv.innerHTML = '$$' + previewVal + '$$';
  typesetMath();
  
  // Update mathField if conversion occurred
  if (mathField.getValue('latex') !== val) {
    mathField.setValue(val);
  }
}

function syncFromText(){
  let val = textArea.value;
  
  // Convert polyatomic ions
  val = convertPolyatomicIons(val);
  
  // Auto-wrap single capital letters (optionally followed by lowercase) before subscripts/superscripts
  // This converts patterns like "A_1" to "{A}_1" and "Ca_2" to "{Ca}_2"
  val = val.replace(/\b([A-Z][a-z]?)(?=[\^_])/g, '{$1}');
  
  // Store as raw (user edits don't include \! since they can't see it)
  rawLatex = val;
  
  // Generate word equation from the raw version
  wordOutput.value = toWordEquation(rawLatex);
  
  // Preview WITHOUT \!
  const previewVal = val.replace(/\\!/g, '');
  previewDiv.innerHTML = '$$' + previewVal + '$$';
  typesetMath();
  mathField.setValue(val);
}

// Fixed regex to match the actual state format: _{(state)}
const stateRegex = /_\{\((?:s|l|g|aq)\)\}$/;

function setupMathField(){
  mathField.setOptions({
    virtualKeyboardMode:'off',
    inlineShortcuts:{},
    overrideDefaultInlineShortcuts:true,
    mathModeSpace: '\\:'
  });
  mathField.addEventListener('input', syncFromMath);
  textArea.addEventListener('input', syncFromText);

  mathField.addEventListener('keydown', (e)=>{
    // Keep typing inside superscripts/subscripts until explicitly exited
    if(e.key === '^'){
      e.preventDefault();
      insertText('^{\\placeholder{}}');
      return;
    }
    if(e.key === '_'){
      e.preventDefault();
      insertText('_{\\placeholder{}}');
      return;
    }
    
    const latex = mathField.getValue('latex') || '';
    
    // Auto-advance to superscript after completing numeric subscript
    // When typing a letter after _{digits}, insert ^{} first
    if(/^[A-Za-z]$/.test(e.key)){
      // Check if we're right after a numeric subscript: ..._{digits}|
      const match = latex.match(/_{(\d+)}$/);
      if(match){
        e.preventDefault();
        mathField.insert(`^{\\placeholder{}}${e.key}`);
        return;
      }
    }
    
    if(e.key !== 'Backspace' && e.key !== 'Delete') return;
    
    // Get cursor position
    const position = mathField.offsetOf(mathField.model.at(mathField.model.position));
    
    if(e.key === 'Backspace'){
      // Check if there's a state pattern before the cursor
      const beforeCursor = latex.substring(0, position);
      // Match states like (s), (l), (g), (aq) or old format _{(s)}, _{(l)}, _{(g)}, _{(aq)}
      const stateMatch = beforeCursor.match(/(_\{\\?\(?(?:s|l|g|aq)\)?\}|\((?:s|l|g|aq)\))$/);
      if(stateMatch){
        e.preventDefault();
        const newLatex = beforeCursor.substring(0, beforeCursor.length - stateMatch[0].length) + latex.substring(position);
        mathField.setValue(newLatex);
        // Set cursor position after deletion
        mathField.executeCommand(['performWithFeedback', 'moveToMathFieldEnd']);
        mathField.executeCommand(['performWithFeedback', 'moveToPreviousChar']);
        for(let i = 0; i < (latex.substring(position).length); i++){
          mathField.executeCommand(['performWithFeedback', 'moveToPreviousChar']);
        }
        syncFromMath();
        return;
      }
    }
    
    if(e.key === 'Delete'){
      // Check if there's a state pattern after the cursor
      const afterCursor = latex.substring(position);
      // Match states like (s), (l), (g), (aq) or old format _{(s)}, _{(l)}, _{(g)}, _{(aq)}
      const stateMatch = afterCursor.match(/^(_\{\\?\(?(?:s|l|g|aq)\)?\}|\((?:s|l|g|aq)\))/);
      if(stateMatch){
        e.preventDefault();
        const newLatex = latex.substring(0, position) + afterCursor.substring(stateMatch[0].length);
        mathField.setValue(newLatex);
        // Restore cursor position
        mathField.executeCommand(['performWithFeedback', 'moveToMathFieldStart']);
        for(let i = 0; i < position; i++){
          mathField.executeCommand(['performWithFeedback', 'moveToNextChar']);
        }
        syncFromMath();
        return;
      }
    }
  });

  textArea.addEventListener('keydown', (e)=>{
    if(e.key !== 'Backspace' && e.key !== 'Delete') return;
    const v = textArea.value || '';
    const cursorPos = textArea.selectionStart;
    
    if(e.key === 'Backspace'){
      // Check if there's a state pattern before the cursor
      const beforeCursor = v.substring(0, cursorPos);
      const stateMatch = beforeCursor.match(/_\{\\?\(?(?:s|l|g|aq)\)?\}$/);
      if(stateMatch){
        e.preventDefault();
        const result = beforeCursor.substring(0, beforeCursor.length - stateMatch[0].length) + v.substring(cursorPos);
        textArea.value = result;
        const newPos = cursorPos - stateMatch[0].length;
        textArea.setSelectionRange(newPos, newPos);
        syncFromText();
      }
    }
    
    if(e.key === 'Delete'){
      // Check if there's a state pattern after the cursor
      const afterCursor = v.substring(cursorPos);
      const stateMatch = afterCursor.match(/^_\{\\?\(?(?:s|l|g|aq)\)?\}/);
      if(stateMatch){
        e.preventDefault();
        const result = v.substring(0, cursorPos) + afterCursor.substring(stateMatch[0].length);
        textArea.value = result;
        textArea.setSelectionRange(cursorPos, cursorPos);
        syncFromText();
      }
    }
  });

  mathField.focus();
  syncFromMath();
}

function applyState(state){
  // 简单插入状态占位符
  mathField.insert(`_{(\\text{${state}})}`);
  syncFromMath();
}

function insertText(text){ mathField.insert(text); syncFromMath(); }

const chemKeys = [
  { display: '\\rightarrow', insert: ' \\rightarrow ' },
  { display: '\\rightleftharpoons', insert: ' \\rightleftharpoons ' },
  { display: '\\xrightarrow{\\placeholder{}}', insert: ' \\xrightarrow{\\placeholder{}\\!} ' },
  { display: '(s)', insert: '(s)' },
  { display: '(l)', insert: '(l)' },
  { display: '(g)', insert: '(g)' },
  { display: '(aq)', insert: '(aq)' },
  { display: '{\\mathrm{\\placeholder{}}^{\\placeholder{}}}(aq)', insert: '{\\mathrm{\\placeholder{}\\!}^{\\placeholder{}}}(aq)' },
  { display: '\\mathrm{\\placeholder{}}^{\\placeholder{}}', insert: '\\mathrm{\\placeholder{}\\!}^{\\placeholder{}}' },
  { display: '\\xrightarrow{\\Delta}', insert: ' \\xrightarrow{\\Delta} ' },
  { display: '^{\\placeholder{}}_{\\placeholder{}}\\mathrm{\\placeholder{}}', insert: '^{\\placeholder{}}_{\\placeholder{}}\\mathrm{\\placeholder{}}' },
  { display: '\\alpha', insert: '\\alpha' },
  { display: '\\beta', insert: '\\beta' },
  { display: '\\gamma', insert: '\\gamma' },
  { display: '\\overline{\\beta}\\:', insert: '\\overline{\\beta}\\:' }
];

function buildKeys(){
  const container = document.getElementById('keyboard');
  container.innerHTML = '';
  chemKeys.forEach(key => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'key';
    button.innerHTML = '$$' + key.display + '$$';
    button.addEventListener('click', () => { if(key.action) key.action(); else insertText(key.insert); });
    container.appendChild(button);
  });
  if(window.MathJax) window.MathJax.typesetPromise([container]);
}

(async()=>{
  const urls = ['https://cdn.jsdelivr.net/npm/mathlive/dist/mathlive.min.js','https://unpkg.com/mathlive/dist/mathlive.min.js'];
  let mathLiveLoaded = false;
  
  for(const url of urls){
    try{
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url; 
        script.defer = true; 
        script.onload = () => {
          mathLiveLoaded = true;
          resolve();
        }; 
        script.onerror = reject;
        document.head.appendChild(script);
      });
      break;
    }catch(e){
      console.warn('Failed to load MathLive from', url, e);
    }
  }
  
  // Wait for MathLive to be defined
  if(window.customElements && window.customElements.whenDefined) {
    try {
      await customElements.whenDefined('math-field');
    } catch(e) {
      console.warn('MathLive custom element not defined', e);
    }
  }
  
  // Setup regardless of MathLive status
  setupMathField();
  buildKeys();
})();

document.getElementById('copyLatex').addEventListener('click', () => {
  // Remove \! from copied LaTeX
  const cleanLatex = textArea.value.replace(/\\!/g, '');
  copyToClipboard(cleanLatex, 'LaTeX');
});

document.getElementById('copyWordBtn').addEventListener('click', () => {
  copyToClipboard(wordOutput.value, 'word equation');
});

document.getElementById('headerCopyLatex').addEventListener('click', () => {
  // Remove \! from copied LaTeX
  const cleanLatex = textArea.value.replace(/\\!/g, '');
  copyToClipboard(cleanLatex, 'LaTeX');
});

document.getElementById('headerCopyWord').addEventListener('click', () => {
  copyToClipboard(wordOutput.value, 'word equation');
});

