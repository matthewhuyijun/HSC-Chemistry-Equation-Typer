# Word UnicodeMath Conversion Rules

Complete reference for LaTeX → Word UnicodeMath conversion used in Chemistry Typer.

---

## 🎯 Conversion Pipeline

The conversion happens in 3 stages:

1. **Tokenize** - Break LaTeX into structured tokens
2. **Parse** - Build an Abstract Syntax Tree (AST)
3. **Convert** - Transform AST to UnicodeMath

---

## 📝 Basic Elements

### Element Symbols

| LaTeX | Word UnicodeMath | Description |
|-------|------------------|-------------|
| `H` | `H` | Single letter element |
| `Ca` | `〖Ca〗` | Multi-letter elements get `〖...〗` grouping |
| `Mg` | `〖Mg〗` | Prevents Word from treating as M×g |

### Numbers

| LaTeX | Word UnicodeMath |
|-------|------------------|
| `2` | `2` |
| `123` | `123` |

---

## 🔬 Chemical Notation

### Subscripts (stoichiometry, formulas)

| LaTeX | Word UnicodeMath | Example |
|-------|------------------|---------|
| `H_2` | `H_2 ` | Water hydrogen |
| `H_2O` | `H_2 O` | Water |
| `Ca_{10}` | `〖Ca〗_(10) ` | Large subscripts need `()` |

**Rule**: Subscripts use `_`, with space after. Multi-digit subscripts need parentheses.

### Superscripts (charges, exponents)

| LaTeX | Word UnicodeMath | Example |
|-------|------------------|---------|
| `Na^+` | `〖Na〗^(+) ` | Sodium ion |
| `Ca^{2+}` | `〖Ca〗^(2+) ` | Calcium ion |
| `SO_4^{2-}` | `〖SO〗_4 ^(2-) ` | Sulfate ion |

**Rule**: Superscripts use `^()`, always wrapped in parentheses, with space after.

### Combined Scripts (normal notation)

| LaTeX | Word UnicodeMath | Example |
|-------|------------------|---------|
| `Ca^{2+}` | `〖Ca〗^(2+) ` | Charge only |
| `SO_4^{2-}` | `〖SO〗_4 ^(2-) ` | Subscript then superscript |

**Rule**: Subscript first, then superscript, both with trailing spaces.

---

## ☢️ Isotope Notation

**Special case**: When superscript comes BEFORE the element.

### Format: `(_atomic^mass)Element`

| LaTeX Pattern | Word UnicodeMath | Example |
|---------------|------------------|---------|
| `^{14}_6C` | `(_6^14)C` | Carbon-14 |
| `^{235}_{92}U` | `(_92^235)U` | Uranium-235 |
| `_{92}^{235}U` | `(_92^235)U` | Same (order doesn't matter) |
| `^{14}_6{C}` | `(_6^14)C` | With braces |

**Rules**:
- Detect when `^` or `_` appears BEFORE an element token
- Group as `(_sub^sup)Element`
- No parentheses around the numbers themselves
- Multi-letter elements still get `〖...〗`: `(_92^235)〖Uus〗`

---

## ⚡ Operators & Symbols

### Arrows (reactions)

| LaTeX | Unicode | Word |
|-------|---------|------|
| `\rightarrow` or `\to` | `→` | ` → ` |
| `\leftarrow` | `←` | ` ← ` |
| `\leftrightarrow` | `↔` | ` ↔ ` |
| `\rightleftharpoons` | `⇌` | ` ⇌ ` |
| `\Rightarrow` | `⇒` | ` ⇒ ` |
| `\Leftarrow` | `⇐` | ` ⇐ ` |
| `\Leftrightarrow` | `⇔` | ` ⇔ ` |

**Rule**: Arrows get spaces on both sides.

### Labeled Arrows

| LaTeX | Word UnicodeMath | Example |
|-------|------------------|---------|
| `\xrightarrow{heat}` | `□(→┴heat )` | Reaction conditions above arrow |
| `\xleftarrow{cool}` | `□(←┴cool )` | Reverse with label |

**Format**: `□(arrow┴label )`

### Math Operators

| LaTeX | Unicode | Word |
|-------|---------|------|
| `+` | `+` | ` + ` |
| `\pm` | `±` | `±` |
| `\times` | `×` | `×` |
| `\cdot` | `·` | `·` |
| `\div` | `÷` | `÷` |

### Greek Letters

| LaTeX | Unicode | LaTeX | Unicode |
|-------|---------|-------|---------|
| `\alpha` | `α` | `\beta` | `β` |
| `\gamma` | `γ` | `\delta` | `δ` |
| `\Delta` | `Δ` | `\epsilon` | `ε` |
| `\theta` | `θ` | `\Theta` | `Θ` |
| `\lambda` | `λ` | `\Lambda` | `Λ` |
| `\mu` | `μ` | `\pi` | `π` |
| `\sigma` | `σ` | `\Sigma` | `Σ` |
| `\phi` | `φ` | `\Phi` | `Φ` |
| `\omega` | `ω` | `\Omega` | `Ω` |

---

## 📐 Math Structures

### Fractions

| LaTeX | Word UnicodeMath |
|-------|------------------|
| `\frac{1}{2}` | `1⁄2` |
| `\frac{m}{n}` | `m⁄n` |

**Format**: `numerator⁄denominator` (using fraction slash ⁄)

### Square Roots

| LaTeX | Word UnicodeMath |
|-------|------------------|
| `\sqrt{2}` | `√(2)` |
| `\sqrt{x+y}` | `√(x+y)` |

**Format**: `√(content)`

### Decorations

| LaTeX | Word UnicodeMath | Description |
|-------|------------------|-------------|
| `\overline{AB}` | `AB̅` | Overline combining character |
| `\bar{x}` | `x̄` | Bar accent |
| `\hat{x}` | `x̂` | Hat/circumflex |
| `\tilde{x}` | `x̃` | Tilde |
| `\vec{v}` | `v⃗` | Vector arrow |

---

## 🧪 Chemical States

### State Symbols (aq, s, l, g)

| LaTeX | Word UnicodeMath | Example |
|-------|------------------|---------|
| `_{(aq)}` | `((aq))` | Aqueous solution |
| `_{(s)}` | `((s))` | Solid |
| `_{(l)}` | `((l))` | Liquid |
| `_{(g)}` | `((g))` | Gas |
| `_{\text{aq}}` | `((aq))` | With \text command |

**Rule**: State symbols become double-parenthesized, inline (not subscript).

### Complete Examples

```
LaTeX:     H_2O_{(l)}
Word:      H_2 O((l))

LaTeX:     Na^+_{(aq)}
Word:      〖Na〗^(+) ((aq))

LaTeX:     CaCO_3_{(s)}
Word:      〖CaCO〗_3 ((s))
```

---

## 🔍 Grouping & Parentheses

### Explicit Groups

| LaTeX | Word UnicodeMath |
|-------|------------------|
| `{...}` | `(...)` |
| `(...)` | `(...)` |

**Rule**: Braces become parentheses in groups.

### Multi-character Elements

**Critical Rule**: Multi-letter element symbols MUST be wrapped in `〖...〗` to prevent Word from treating them as multiplication.

```
LaTeX:  Ca
Word:   〖Ca〗    (NOT "C×a")

LaTeX:  Mg
Word:   〖Mg〗    (NOT "M×g")

LaTeX:  Fe
Word:   〖Fe〗    (NOT "F×e")
```

---

## 🚫 Ignored Commands

These LaTeX spacing commands are stripped:

- `\!` - Negative thin space
- `\,` - Thin space
- `\;` - Thick space
- `\:` - Medium space
- `\quad` - Quad space
- `\qquad` - Double quad space

**Reason**: Word UnicodeMath handles spacing automatically.

---

## 📊 Complete Conversion Examples

### Simple Molecules

```
H_2O         →  H_2 O
CO_2         →  〖CO〗_2 
NH_3         →  〖NH〗_3 
CH_4         →  〖CH〗_4 
```

### Ions

```
Na^+         →  〖Na〗^(+) 
Cl^-         →  〖Cl〗^(-) 
Ca^{2+}      →  〖Ca〗^(2+) 
SO_4^{2-}    →  〖SO〗_4 ^(2-) 
Fe^{3+}      →  〖Fe〗^(3+) 
```

### Isotopes

```
^{14}_6C              →  (_6^14)C
^{235}_{92}U          →  (_92^235)U
^{12}_6{C}            →  (_6^12)C
_{1}^{2}H             →  (_1^2)H
```

### Reactions

```
2H_2 + O_2 \to 2H_2O
→  2H_2  + O_2  →  2H_2 O

Na^+ + Cl^- \to NaCl
→  〖Na〗^(+)  + 〖Cl〗^(-)  →  〖NaCl〗
```

### Complex Examples

```
CaCO_3_{(s)} \to CaO_{(s)} + CO_2_{(g)}
→  〖CaCO〗_3 ((s)) →  〖CaO〗((s)) + 〖CO〗_2 ((g))

\xrightarrow{heat} 2H_2O_{(l)}
→  □(→┴heat ) 2H_2 O((l))

^{235}_{92}U \to ^{231}_{90}Th + ^4_2He
→  (_92^235)U →  (_90^231)〖Th〗 + (_2^4)〖He〗
```

---

## 🛠️ Implementation Details

### AST Node Types

- **`isotope`** - Special handling for pre-element scripts
- **`element`** - Chemical element symbols
- **`number`** - Numeric values
- **`symbol`** - Greek letters, operators
- **`operator`** - +, -, etc.
- **`command`** - LaTeX commands like `\rightarrow`
- **`group`** - Grouped expressions
- **`char`** - Other characters

### Key Functions

1. **`tokenizeLatex(latex)`** - Lexical analysis
2. **`parseToAST(tokens)`** - Syntax analysis
3. **`astToUnicodeMath(node)`** - Code generation

### Isotope Detection Logic

```javascript
// Pattern: ^{mass}_{atomic}Element
if (token.type === 'superscript') {
    const superscript = parseScriptArg();
    if (peek().type === 'subscript') {
        const subscript = parseScriptArg();
        if (peek().type === 'element') {
            // It's an isotope!
            return new IsotopeNode(element, subscript, superscript);
        }
    }
}
```

### Output Format

```javascript
// Isotope: (_sub^sup)Element
`(_${subscript}^${superscript})${element}`

// Regular: Element_sub ^(sup) 
`${element}_${subscript} ^(${superscript}) `
```

---

## 🎨 Special Characters Reference

### Grouping Brackets
- `〖` - Left mathematical bracket (U+3016)
- `〗` - Right mathematical bracket (U+3017)

### Fraction
- `⁄` - Fraction slash (U+2044)

### Math Symbols
- `√` - Square root (U+221A)
- `□` - White square (for labeled arrows) (U+25A1)
- `┴` - Down tack (arrow label separator) (U+2534)

### Combining Characters
- `̅` - Combining overline (U+0305)
- `̄` - Combining macron (U+0304)
- `̂` - Combining circumflex (U+0302)
- `̃` - Combining tilde (U+0303)
- `⃗` - Combining right arrow above (U+20D7)

---

## 📌 Best Practices

1. **Always wrap multi-letter elements** in `〖...〗`
2. **Isotopes use parentheses around scripts**, not the numbers
3. **Subscripts get trailing space**: `_2 ` not `_2`
4. **Superscripts always in parentheses**: `^(+)` not `^+`
5. **Operators get surrounding spaces**: ` + ` not `+`
6. **State symbols are inline**, not subscripts: `((aq))` not `_(aq)`

---

## ⚠️ Common Pitfalls

### ❌ Wrong
```
Ca2+         → Ca2+     (Word sees: C × a × 2 + nothing)
Mg_2         → Mg_2     (Word sees: M × g subscript 2)
Na^+         → Na^+     (missing parentheses)
H_2O_(aq)    → H_2 O_(aq)  (state as subscript)
```

### ✅ Correct
```
Ca^{2+}      → 〖Ca〗^(2+) 
Mg_2         → 〖Mg〗_2 
Na^+         → 〖Na〗^(+) 
H_2O_{(aq)}  → H_2 O((aq))
```

---

## 🔗 Related Documentation

- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - User guide for the app
- [TEST_CASES.md](TEST_CASES.md) - Comprehensive test suite
- [README.md](README.md) - Full technical documentation

---

*Last Updated: October 2025*
*Chemistry Typer - AST-Based LaTeX to Word Converter*



