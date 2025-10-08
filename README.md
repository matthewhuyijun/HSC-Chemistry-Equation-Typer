# HSC Chemistry Equation Typer

A simple web app for **HSC students and teachers** to type and convert chemistry equations (including isotopes) into **Word-ready format**.
Equations can be copied directly into **Microsoft Word**, **Notion**, or even **Google Docs** (with the LaTeX add-on).

🔗 **Try it here:** [HSC Chemistry Equation Typer](https://matthewhuyijun.github.io/HSC-Chemistry-Equation-Typer/)

---

## ✨ Features

* Type chemistry equations in LaTeX using a **live math editor**.
* Correct isotope formatting: e.g. `^{14}_{6}C` → `{_{6}^{14}}C`.
* **Direct copy-paste** into Word and Notion without losing formatting.
* **Unicode Support (New!)** — use the **Unicode-Linear** mode for full compatibility with Microsoft Word.

  * After pasting, select the equation and choose **Convert → Professional** for perfect rendering.
* Export to Google Docs (with [Auto-LaTeX Equations](https://workspace.google.com/marketplace/app/autolatex_equations/850293439076) or similar add-ons).

---

## 🧪 How to Use

1. **Enter your equation**

   * Use the provided math keyboard or type LaTeX directly.
   * Example:

     ```
     ^{14}_{6}C + O_2 → CO_2
     ```

2. **Add a state (s, l, g, aq)**

   * Finish typing the substance (e.g. `NaCl`).
   * Click `(aq)`, `(s)`, `(l)`, or `(g)` — it automatically wraps:

     ```
     {NaCl}_{(aq)}
     ```

3. **Subscripts and superscripts**

   * **Windows:** `_` (underscore) for subscript, `^` (caret) for superscript.
   * **Mac:** same keys `_` and `^` (hold **Shift+6** for `^`).

4. **Copy the result**

   * Use the **Copy Word Equation** button for Microsoft Word.
   * Or use **Copy LaTeX** for Notion, Overleaf, or Google Docs.
   * **Unicode-Linear Mode (New)** — for Word users needing Unicode-based formatting. After pasting, go to **Convert → Professional** to format equations properly.

---

## 📖 Example

**Input in LaTeX:**

```
^{14}_{6}C + O_2 → CO_2
```

**Output (Word Professional):**
₆¹⁴C + O₂ → CO₂

---

## 🛠️ Technology

* [MathLive](https://cortexjs.io/mathlive/) — interactive math editor
* [MathJax](https://www.mathjax.org/) — LaTeX rendering engine
* Hosted on **GitHub Pages**

---

## 📚 About

Created for **HSC Chemistry students and teachers** to simplify chemical equation formatting.
Runs entirely in your browser — **no installation required**.
