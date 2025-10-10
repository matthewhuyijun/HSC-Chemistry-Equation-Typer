# Quick Reference - Chemistry Typer

## 🎯 Common Patterns

### Basic Formulas

| Chemical | LaTeX Input | Word Output |
|----------|-------------|-------------|
| Water | `{H}_2{O}` | `H_2 O` |
| Oxygen Gas | `{O}_2` | `O_2 ` |
| Carbon Dioxide | `{CO}_2` | `〖CO〗_2 ` |
| Sodium Chloride | `{NaCl}` | `〖NaCl〗` |
| Sulfuric Acid | `{H}_2{SO}_4` | `H_2 〖SO〗_4 ` |
| Glucose | `{C}_6{H}_{12}{O}_6` | `C_6 H_12 O_6 ` |

### Ions

| Ion | LaTeX Input | Word Output |
|-----|-------------|-------------|
| Sodium ion | `{Na}^{+}` | `Na^(+) ` |
| Chloride ion | `{Cl}^{-}` | `〖Cl〗^(-) ` |
| Sulfate ion | `{SO}_4^{2-}` | `〖SO〗_4 ^(2-) ` |
| Ammonium ion | `{NH}_4^{+}` | `〖NH〗_4 ^(+) ` |
| Hydroxide ion | `{OH}^{-}` | `OH^(-) ` |
| Carbonate ion | `{CO}_3^{2-}` | `〖CO〗_3 ^(2-) ` |

### With States

| Formula | LaTeX Input | Word Output |
|---------|-------------|-------------|
| Water (liquid) | `{H}_2{O}_{(l)}` | `H_2 O (l)` |
| Sodium chloride (solid) | `{NaCl}_{(s)}` | `〖NaCl〗 (s)` |
| Hydrochloric acid (aq) | `{HCl}_{(aq)}` | `〖HCl〗 (aq)` |
| Oxygen (gas) | `{O}_2_{(g)}` | `O_2  (g)` |

### Complex Formulas

| Chemical | LaTeX Input | Word Output |
|----------|-------------|-------------|
| Iron(III) hydroxide | `{Fe}{(}{OH}{)}_3` | `〖Fe〗(OH)_3 ` |
| Calcium phosphate | `{Ca}_3{(}{PO}_4{)}_2` | `〖Ca〗_3 (〖PO〗_4 )_2 ` |
| Copper(II) sulfate pentahydrate | `{CuSO}_4 \cdot 5{H}_2{O}` | `〖CuSO〗_4 ·5H_2 O` |

## 🔄 Reaction Arrows

| Symbol | LaTeX | Output |
|--------|-------|--------|
| Forward | `\rightarrow` or `\to` | `→` |
| Equilibrium | `\rightleftharpoons` | `⇌` |
| Implies | `\Rightarrow` | `⇒` |
| Labeled arrow (heat) | `\xrightarrow{\Delta}` | `□(→┴Δ )` |
| Labeled arrow (catalyst) | `\xrightarrow{\text{Pt}}` | `□(→┴Pt )` |

## 🧪 Full Reactions

### Combustion of Methane
```latex
{CH}_4_{(g)} + 2{O}_2_{(g)} \rightarrow {CO}_2_{(g)} + 2{H}_2{O}_{(l)}
```
→ `〖CH〗_4 (g) + 2O_2 (g) → 〖CO〗_2 (g) + 2H_2 O (l)`

### Neutralization
```latex
{HCl}_{(aq)} + {NaOH}_{(aq)} \rightarrow {NaCl}_{(aq)} + {H}_2{O}_{(l)}
```
→ `〖HCl〗 (aq) + 〖NaOH〗 (aq) → 〖NaCl〗 (aq) + H_2 O (l)`

### Displacement
```latex
{Fe}_{(s)} + {CuSO}_4_{(aq)} \rightarrow {FeSO}_4_{(aq)} + {Cu}_{(s)}
```
→ `〖Fe〗 (s) + 〖CuSO〗_4 (aq) → 〖FeSO〗_4 (aq) + 〖Cu〗 (s)`

### Equilibrium (Haber Process)
```latex
{N}_2_{(g)} + 3{H}_2_{(g)} \rightleftharpoons 2{NH}_3_{(g)}
```
→ `N_2 (g) + 3H_2 (g) ⇌ 2〖NH〗_3 (g)`

### With Catalyst and Heat
```latex
{N}_2 + 3{H}_2 \xrightarrow{\text{Fe, } \Delta} 2{NH}_3
```
→ `N_2 + 3H_2 □(→┴Fe, Δ ) 2〖NH〗_3 `

## 🔬 Isotopes

| Isotope | LaTeX Input | Word Output |
|---------|-------------|-------------|
| Carbon-14 | `^{14}_{6}{C}` | `^(14) _6 C` |
| Uranium-235 | `^{235}_{92}{U}` | `^(235) _92 U` |
| Hydrogen-2 (Deuterium) | `^{2}_{1}{H}` | `^(2) _1 H` |

## 🌍 Greek Letters

| Name | LaTeX | Symbol |
|------|-------|--------|
| Alpha | `\alpha` | α |
| Beta | `\beta` | β |
| Gamma | `\gamma` | γ |
| Delta (uppercase) | `\Delta` | Δ |
| Lambda | `\lambda` | λ |
| Mu | `\mu` | μ |
| Omega | `\omega` | ω |

### Common Uses
- **Δ** - Change/heat: `\xrightarrow{\Delta}`
- **α** - Alpha particle: `\alpha`
- **β** - Beta particle: `\beta`
- **γ** - Gamma ray: `\gamma`
- **λ** - Wavelength: `\lambda`

## ⚡ Keyboard Shortcuts (Button Panel)

Click these buttons for quick insertion:

| Button | Inserts | Use For |
|--------|---------|---------|
| `→` | `\rightarrow` | Forward reaction |
| `⇌` | `\rightleftharpoons` | Equilibrium |
| `→^□` | `\xrightarrow{\placeholder{}}` | Labeled arrow |
| `(s)` | `_{(s)}` | Solid state |
| `(l)` | `_{(l)}` | Liquid state |
| `(g)` | `_{(g)}` | Gas state |
| `(aq)` | `_{(aq)}` | Aqueous solution |
| `^□_(aq)` | `{^{\placeholder{}}}_{(aq)}` | Ion in solution |
| `^□_□` | `^{\placeholder{}}_{placeholder{}}` | Isotope template |
| `α` | `\alpha` | Alpha particle |
| `β` | `\beta` | Beta particle |
| `γ` | `\gamma` | Gamma ray |
| `Δ` | `\xrightarrow{\Delta}` | Heat arrow |
| `β̅` | `\overline{\beta}` | Anti-beta (positron) |

## 💡 Pro Tips

### 1. Auto-Wrapping Elements
When you type `A_1`, it automatically becomes `{A}_1` → `A_1 `

### 2. State Symbol Shortcut
Use the state buttons instead of typing `_{(aq)}` manually

### 3. Multi-Letter Elements
Type `{Cl}_2` not `Cl_2` to ensure proper grouping

### 4. Spacing
The AST automatically adds spaces after subscripts/superscripts for Word compatibility

### 5. Copy Workflow
1. Type equation
2. Click "Copy Word Equation"
3. Paste into Word (Ctrl+V / Cmd+V)
4. Word auto-converts to editable equation

### 6. Preview
The MathJax preview shows how your equation looks, but copy the "Word Equation" output for pasting

### 7. Dark Mode
Toggle between light/dark/system modes using the sun/moon/monitor buttons

## 🚫 Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| `Cl_2` | `{Cl}_2` | Need braces for multi-letter |
| `H2O` | `{H}_2{O}` | Missing subscript syntax |
| `SO4^2-` | `{SO}_4^{2-}` | Missing braces and superscript |
| `Fe(OH)3 (aq)` | `{Fe}{(}{OH}{)}_3_{(aq)}` | Wrong structure |
| `Na+ (aq)` | `{Na}^{+}_{(aq)}` | Charge needs superscript |

## 📋 Checklist for Perfect Equations

- [ ] All multi-letter elements in braces: `{Na}`, `{Cl}`, `{Fe}`
- [ ] Subscripts use `_` syntax: `{H}_2`
- [ ] Superscripts use `^` syntax: `{Na}^{+}`
- [ ] States use `_{(s)}`, `_{(l)}`, `_{(g)}`, `_{(aq)}`
- [ ] Arrows use LaTeX commands: `\rightarrow`, `\rightleftharpoons`
- [ ] Copied the "Word Equation" output, not LaTeX
- [ ] Pasted into Word and verified it's editable

## 🎓 HSC Chemistry Specific

### Common HSC Reactions

**Acids and Bases:**
```latex
{HCl}_{(aq)} + {NaOH}_{(aq)} \rightarrow {NaCl}_{(aq)} + {H}_2{O}_{(l)}
```

**Precipitation:**
```latex
{Pb}{(}{NO}_3{)}_2_{(aq)} + 2{KI}_{(aq)} \rightarrow {PbI}_2_{(s)} + 2{KNO}_3_{(aq)}
```

**Redox:**
```latex
{Zn}_{(s)} + {Cu}^{2+}_{(aq)} \rightarrow {Zn}^{2+}_{(aq)} + {Cu}_{(s)}
```

**Combustion:**
```latex
{C}_3{H}_8_{(g)} + 5{O}_2_{(g)} \rightarrow 3{CO}_2_{(g)} + 4{H}_2{O}_{(g)}
```

### Common Ions Table

| Cation | Formula | Anion | Formula |
|--------|---------|-------|---------|
| Sodium | `{Na}^{+}` | Chloride | `{Cl}^{-}` |
| Potassium | `{K}^{+}` | Bromide | `{Br}^{-}` |
| Calcium | `{Ca}^{2+}` | Sulfate | `{SO}_4^{2-}` |
| Magnesium | `{Mg}^{2+}` | Carbonate | `{CO}_3^{2-}` |
| Aluminum | `{Al}^{3+}` | Phosphate | `{PO}_4^{3-}` |
| Iron(II) | `{Fe}^{2+}` | Hydroxide | `{OH}^{-}` |
| Iron(III) | `{Fe}^{3+}` | Nitrate | `{NO}_3^{-}` |
| Copper(II) | `{Cu}^{2+}` | Sulfite | `{SO}_3^{2-}` |
| Ammonium | `{NH}_4^{+}` | Acetate | `{CH}_3{COO}^{-}` |

---

**Quick Start:** Open `index.html` → Type equation → Click "Copy Word Equation" → Paste into Word ✨

