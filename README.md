# HSC Chemistry Equation Typer (AST Edition)

A LaTeX-to-UnicodeMath converter optimized for chemistry equations, now powered by **Abstract Syntax Tree (AST)** parsing instead of regex.

## 🎯 Purpose

This tool helps HSC Chemistry students type chemical equations that can be pasted directly into Microsoft Word as **fully editable equations**. The output uses UnicodeMath syntax, which Word's Equation Editor understands natively.

## ✨ New in AST Version

### What Changed?
- **Regex-based conversion** → **AST-based conversion**
- More reliable handling of nested structures
- Better state symbol `(s)`, `(l)`, `(g)`, `(aq)` placement
- Cleaner subscript/superscript spacing
- Easier to extend with new features

### Why AST?
| Problem (Regex) | Solution (AST) |
|-----------------|----------------|
| State symbols `(aq)` merged into subscripts | States stay on baseline |
| Nested groups `Fe(OH)3` broke formatting | Hierarchical tree handles nesting |
| Spacing inconsistent | Systematic space insertion |
| Hard to add new syntax | Just add new AST node types |

## 🚀 Features

- ✅ Chemical formulas with subscripts/superscripts
- ✅ Reaction arrows: `→`, `⇌`, `⇒`
- ✅ Labeled arrows: `→^(heat)`, `→_(catalyst)`
- ✅ State symbols: `(s)`, `(l)`, `(g)`, `(aq)` on baseline
- ✅ Ion charges: `SO_4^(2-)`, `Na^(+)`
- ✅ Greek letters: α, β, γ, Δ
- ✅ Isotope notation: `^235_92U`
- ✅ Dark mode support
- ✅ One-click copy to clipboard
- ✅ Real-time preview with MathJax

## 📖 How to Use

### Basic Typing
1. Open `index.html` in any modern browser
2. Type your chemical equation in the math field
3. Click "Copy Word Equation"
4. Paste into Microsoft Word
5. Word automatically converts it to an editable equation

### Keyboard Shortcuts
The button panel provides quick access to common symbols:
- **→** - Reaction arrow
- **⇌** - Equilibrium arrow
- **States** - `(s)`, `(l)`, `(g)`, `(aq)` buttons
- **Greek** - α, β, γ, Δ
- **Isotopes** - Superscript/subscript templates

### Example Workflow

**Type this:**
```
{Fe}_{(s)} + {CuSO}_4_{(aq)} \rightarrow {FeSO}_4_{(aq)} + {Cu}_{(s)}
```

**Get this (Word UnicodeMath):**
```
〖Fe〗 (s) + 〖CuSO〗_4 (aq) → 〖FeSO〗_4 (aq) + 〖Cu〗 (s)
```

**Paste into Word:**
- Opens as editable equation
- All subscripts/superscripts work
- States stay on the baseline
- No manual formatting needed

## 🏗️ AST Architecture

### Conversion Pipeline

```
LaTeX Input
    ↓
[Tokenizer]
    ↓
Token Stream
    ↓
[Parser]
    ↓
Abstract Syntax Tree (AST)
    ↓
[AST Traversal]
    ↓
UnicodeMath Output
    ↓
[Post-Processing]
    ↓
Final Result
```

### AST Node Types

```javascript
class ASTNode {
  type: 'element' | 'number' | 'command' | 'operator' | 'symbol' | ...
  value: string
  children: ASTNode[]
  subscript: ASTNode | null
  superscript: ASTNode | null
}
```

### Example AST

**Input:** `{H}_2{O}`

**AST:**
```
Root
├── Group
│   └── Element: "H"
│       └── subscript: Number "2"
└── Group
    └── Element: "O"
```

**Output:** `H_2 O`

## 🔧 Technical Details

### Tokenization
Breaks LaTeX into meaningful units:
- Commands: `\rightarrow`, `\xrightarrow{}`
- Elements: `H`, `Na`, `Fe` (capital + optional lowercase)
- Numbers: `2`, `3`, `10`
- Operators: `+`, `^`, `_`
- Delimiters: `{`, `}`, `(`, `)`

### Parsing
Builds a hierarchical tree:
- Groups (`{...}`) become container nodes
- Subscripts/superscripts attach to base nodes
- Commands process their arguments recursively

### Conversion Rules
| LaTeX | UnicodeMath | Notes |
|-------|-------------|-------|
| `_2` | `_2 ` | Space after subscript |
| `^{2+}` | `^(2+) ` | Parentheses + space |
| `{Na}` | `Na` | Single letter unwrapped |
| `{Cl}` | `〖Cl〗` | Multi-letter wrapped |
| `\rightarrow` | `→` | Unicode arrow |
| `_{(aq)}` | `(aq)` | State on baseline |

### Spacing Strategy
Critical for Word compatibility:
- **After `_subscript`** → Always add space
- **After `^(superscript)`** → Always add space
- **Before state** → Ensure space: `H_2O (l)` not `H_2O(l)`

## 📝 Common Patterns

### Water
```latex
{H}_2{O}
```
→ `H_2 O`

### Sulfuric Acid
```latex
{H}_2{SO}_4
```
→ `H_2 〖SO〗_4 `

### Iron(III) Hydroxide
```latex
{Fe}{(}{OH}{)}_3
```
→ `〖Fe〗(OH)_3 `

### Sulfate Ion
```latex
{SO}_4^{2-}
```
→ `〖SO〗_4 ^(2-) `

### Combustion Reaction
```latex
{CH}_4 + 2{O}_2 \rightarrow {CO}_2 + 2{H}_2{O}
```
→ `〖CH〗_4 + 2O_2 → 〖CO〗_2 + 2H_2 O`

### Reaction with Catalyst
```latex
{N}_2 + 3{H}_2 \xrightarrow{\text{Fe, } \Delta} 2{NH}_3
```
→ `N_2 + 3H_2 □(→┴Fe, Δ ) 2〖NH〗_3 `

## 🐛 Troubleshooting

### Issue: Word doesn't recognize equation
**Solution:** Make sure you copied the "Word Equation" output, not the LaTeX

### Issue: States appear as subscripts
**Solution:** Use the state buttons or type `_{(aq)}` format

### Issue: Multi-letter elements merge
**Solution:** AST automatically wraps them in `〖〗`

### Issue: Spacing looks wrong in Word
**Solution:** AST adds spaces automatically; if manual edit needed, check TEST_CASES.md

## 📚 Resources

- [Test Cases](TEST_CASES.md) - Comprehensive test examples
- [UnicodeMath Spec](https://www.unicode.org/notes/tn28/) - Official standard
- [Word Equation Editor](https://support.microsoft.com/en-us/office/linear-format-equations-using-unicodemath-and-latex-in-word-2e00618d-b1fd-49d8-8cb4-8d17f25754f8) - Microsoft documentation

## 🎨 UI Features

- **Dark Mode** - Auto-detects system preference or manual toggle
- **Live Preview** - MathJax renders equations in real-time
- **Keyboard Panel** - Quick access to common symbols
- **Copy Buttons** - One-click copy for LaTeX or Word output
- **Toast Notifications** - Confirm successful copy operations

## 🔬 For Developers

### File Structure
```
index.html
├── CSS (embedded)
│   ├── Light/Dark theme tokens
│   ├── Component styles
│   └── Responsive layout
└── JavaScript (embedded)
    ├── tokenizeLatex()      - Lexical analysis
    ├── parseToAST()         - Syntax analysis
    ├── astToUnicodeMath()   - Code generation
    ├── processCommand()     - Command handling
    ├── postProcess()        - Cleanup
    └── syncFromMath()       - UI binding
```

### Extending the AST

**Add a new LaTeX command:**

```javascript
// In processCommand()
if (cmd === '\\yourcommand') {
    const arg = args[0] ? cleanSegment(args[0]) : '';
    return `your-unicode-output(${arg})`;
}
```

**Add a new node type:**

```javascript
// In parseExpression()
if (token.type === 'your_token') {
    node = new ASTNode('your_type', token.value);
}

// In astToUnicodeMath()
case 'your_type':
    result += convertYourType(node);
    break;
```

### Testing
1. Add test case to `TEST_CASES.md`
2. Open `index.html` in browser
3. Type test input
4. Compare output
5. Paste into Word to verify

## 📄 License

This project is provided as-is for educational purposes. Feel free to use, modify, and distribute.

## 🙏 Credits

- **MathLive** - Editable math field
- **MathJax** - LaTeX rendering
- **Lucide** - Icon system
- **Inter Font** - Typography

---

**Made for HSC Chemistry Students** 🧪✨

