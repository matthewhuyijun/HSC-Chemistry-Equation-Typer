# AST-Based Chemistry Typer - Test Cases

## Test 1: Basic Chemical Formula
**Input LaTeX:** `{H}_2{O}`  
**Expected Word Output:** `H_2 O`  
**Description:** Simple water molecule with subscript

## Test 2: Chemical Equation with States
**Input LaTeX:** `{Fe}{(}{OH}{)}_3_{(s)} + 3{HCl}_{(aq)} \rightarrow {FeCl}_3_{(aq)} + 3{H}_2{O}_{(l)}`  
**Expected Word Output:** `〖Fe〗(OH)_3 (s) + 3〖HCl〗 (aq) → 〖FeCl〗_3 (aq) + 3H_2 O (l)`  
**Description:** Complete reaction with multiple states

## Test 3: Ion with Charge
**Input LaTeX:** `{SO}_4^{2-}`  
**Expected Word Output:** `〖SO〗_4 ^(2-) `  
**Description:** Sulfate ion with superscript charge

## Test 4: Labeled Arrow
**Input LaTeX:** `{A} \xrightarrow{\Delta} {B}`  
**Expected Word Output:** `A □(→┴Δ ) B`  
**Description:** Reaction arrow with heat label

## Test 5: Equilibrium Arrow
**Input LaTeX:** `{A} \rightleftharpoons {B}`  
**Expected Word Output:** `A ⇌ B`  
**Description:** Reversible reaction

## Test 6: Complex Formula with Parentheses
**Input LaTeX:** `{Ca}_3{(}{PO}_4{)}_2`  
**Expected Word Output:** `〖Ca〗_3 (〖PO〗_4 )_2 `  
**Description:** Calcium phosphate with nested subscripts

## Test 7: Greek Letters
**Input LaTeX:** `\alpha \beta \gamma`  
**Expected Word Output:** `αβγ`  
**Description:** Greek letter symbols

## Test 8: Isotope Notation
**Input LaTeX:** `^{235}_{92}{U}`  
**Expected Word Output:** `^(235) _92 U`  
**Description:** Uranium-235 isotope

## Test 9: Multiple Products
**Input LaTeX:** `{H}_2 + {Cl}_2 \rightarrow 2{HCl}`  
**Expected Word Output:** `H_2 + 〖Cl〗_2 → 2〖HCl〗`  
**Description:** Hydrogen + Chlorine reaction

## Test 10: Aqueous Solution
**Input LaTeX:** `{NaCl}_{(aq)}`  
**Expected Word Output:** `〖NaCl〗 (aq)`  
**Description:** Sodium chloride in aqueous solution

---

## How the AST Works

### 1. **Tokenization**
The LaTeX string is broken into tokens:
- Commands: `\rightarrow`, `\alpha`, etc.
- Elements: `H`, `Na`, `Fe`, `Ca`
- Numbers: `2`, `3`, `4`
- Operators: `+`, `^`, `_`
- Brackets: `{`, `}`, `(`, `)`

### 2. **Parsing to AST**
Tokens are organized into a tree structure:
```
Root
├── Element: "H"
│   └── Subscript: "2"
├── Operator: "+"
├── Command: "\rightarrow" → "→"
└── Element: "O"
    └── Subscript: "2"
```

### 3. **AST → UnicodeMath Conversion**
The tree is traversed and converted:
- **Elements** → Wrapped in `〖〗` if multi-letter
- **Subscripts** → `_number ` (with space)
- **Superscripts** → `^(content) ` (with space)
- **States** → Kept on baseline: `(s)`, `(l)`, `(g)`, `(aq)`
- **Arrows** → Unicode symbols: `→`, `⇌`, `⇒`

### 4. **Post-Processing**
Final cleanup:
- Ensure spaces before state symbols
- Clean up multiple spaces
- Trim whitespace

---

## Advantages Over Regex

| Feature | Regex Approach | AST Approach |
|---------|----------------|--------------|
| **Nested structures** | Difficult, error-prone | Natural, hierarchical |
| **State handling** | Many special cases | Clean tree traversal |
| **Extensibility** | Add more regexes | Add AST node types |
| **Debugging** | Hard to trace | Inspect tree structure |
| **Consistency** | Rules conflict | Systematic conversion |

---

## Testing Instructions

1. Open `index.html` in a browser
2. Type or paste each **Input LaTeX** into the math field
3. Check the **Word Equation** output matches expected
4. Copy and paste into Microsoft Word
5. Verify it renders correctly as an editable equation

---

## Known Limitations

1. Very complex nested formulas may need additional wrapping
2. Custom LaTeX macros are not supported
3. Matrix/table structures not yet implemented
4. Some advanced math symbols may need manual conversion

---

## Future Enhancements

- [ ] Add AST visualization/debugger
- [ ] Support for common ion auto-replacement (SO4 → SO₄)
- [ ] Matrix and table support
- [ ] Fraction with complex numerators/denominators
- [ ] Integration with ChemDraw/ChemSketch

