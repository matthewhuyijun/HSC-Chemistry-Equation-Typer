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

const POLYATOMIC_IONS = {
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

function applyReplacements(text, caret, replacements) {
  if (!text) {
    return { text, caret };
  }
  let updatedText = text;
  let updatedCaret = caret;
  for (const { pattern, replacement } of replacements) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let result = '';
    let lastIndex = 0;
    let changed = false;
    let localCaret = updatedCaret;
    let match;
    while ((match = regex.exec(updatedText)) !== null) {
      changed = true;
      const start = match.index;
      const end = regex.lastIndex;
      const replacementValue = typeof replacement === 'function'
        ? replacement(...match, start, updatedText)
        : replacement;
      result += updatedText.slice(lastIndex, start) + replacementValue;
      if (localCaret != null && start < localCaret) {
        const delta = replacementValue.length - (end - start);
        localCaret += delta;
      }
      lastIndex = end;
      if (!regex.global) {
        break;
      }
    }
    if (changed) {
      result += updatedText.slice(lastIndex);
      updatedText = result;
      updatedCaret = localCaret;
    }
  }
  return { text: updatedText, caret: updatedCaret };
}

function convertPolyatomicIons(text, caret) {
  if (!text) {
    return { text, caret };
  }

  let updatedText = text;
  let updatedCaret = caret;

  for (const [ion, formatted] of Object.entries(POLYATOMIC_IONS)) {
    if (!updatedText.includes(ion)) continue;

    const escapedIon = ion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = [
      { pattern: new RegExp(`\\(${escapedIon}\\)`, 'g'), replacement: `(${formatted})` },
      { pattern: new RegExp(`(?<!_)${escapedIon}(?![A-Za-z_{])`, 'g'), replacement: formatted }
    ];

    patterns.forEach(({ pattern, replacement }) => {
      const result = applyReplacements(updatedText, updatedCaret, [{ pattern, replacement }]);
      updatedText = result.text;
      updatedCaret = result.caret;
    });
  }

  return { text: updatedText, caret: updatedCaret };
}

function normalizeStateAnnotations(text, caret) {
  const replacements = [
    { pattern: /_\{\s*\\?text\{\s*\(?(aq|s|l|g)\)?\s*\}\s*\}/gi, replacement: (_, state) => `(${state.toLowerCase()})` },
    { pattern: /_\{\s*\(?(aq|s|l|g)\)?\s*\}/gi, replacement: (_, state) => `(${state.toLowerCase()})` },
    { pattern: /_\(\(\s*(aq|s|l|g)\s*\)\)/gi, replacement: (_, state) => `(${state.toLowerCase()})` },
    { pattern: /\\,\\text\{\s*\(?(aq|s|l|g)\)?\s*\}/gi, replacement: (_, state) => `(${state.toLowerCase()})` },
    { pattern: /\\mathrm\{\s*\(?(aq|s|l|g)\)?\s*\}/gi, replacement: (_, state) => `(${state.toLowerCase()})` },
    { pattern: /\\text\{\s*\(?(aq|s|l|g)\)?\s*\}/gi, replacement: (_, state) => `(${state.toLowerCase()})` },
    { pattern: /\(\s*(aq|s|l|g)\s*\)/gi, replacement: (_, state) => `(${state.toLowerCase()})` }
  ];
  return applyReplacements(text, caret, replacements);
}

let isApplyingAutoReplacements = false;

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

function toWordEquation(latex) {
    const supers = {
        // All superscript conversions disabled - keep LaTeX format
    };
    const subs = {
        // All subscript conversions disabled - keep LaTeX format
    };
    {
        const polyProcessed = convertPolyatomicIons(latex, null);
        const stateProcessed = normalizeStateAnnotations(polyProcessed.text, polyProcessed.caret);
        latex = stateProcessed.text;
    }
    const supersToAscii = {};
    for (const [plain, fancy] of Object.entries(supers)) {
        supersToAscii[fancy] = plain;
    }
    const subsToAscii = {};
    for (const [plain, fancy] of Object.entries(subs)) {
        subsToAscii[fancy] = plain;
    }
    const decodeSupers = (value = '') => Array.from(value).map((ch) => supersToAscii[ch] ?? ch).join('');
    const decodeSubs = (value = '') => Array.from(value).map((ch) => subsToAscii[ch] ?? ch).join('');
    const normalizeChemicalInput = (value = '') => {
        const stripped = String(value ?? '').replace(/[〖〗]/g, '').trim();
        if (!stripped) {
            return '';
        }
        let result = '';
        let pendingSub = '';
        let pendingSup = '';
        const flushDecorations = () => {
            if (pendingSub) {
                const subToken = /^[0-9]+$/.test(pendingSub) ? `_${pendingSub}` : `_{${pendingSub}}`;
                result += subToken;
                pendingSub = '';
            }
            if (pendingSup) {
                const supToken = /^[0-9+-]+$/.test(pendingSup) ? `^${pendingSup}` : `^{${pendingSup}}`;
                result += supToken;
                pendingSup = '';
            }
        };
        for (const ch of stripped) {
            if (Object.prototype.hasOwnProperty.call(subsToAscii, ch)) {
                pendingSub += subsToAscii[ch];
                continue;
            }
            if (Object.prototype.hasOwnProperty.call(supersToAscii, ch)) {
                pendingSup += supersToAscii[ch];
                continue;
            }
            flushDecorations();
            result += ch;
        }
        flushDecorations();
        return result;
    };
    const formatWordSymbol = (value = '') => {
        const raw = String(value ?? '').replace(/[〖〗]/g, '').trim();
        if (!raw) {
            return '';
        }
        let base = '';
        let sub = '';
        let sup = '';
        for (const ch of raw) {
            if (Object.prototype.hasOwnProperty.call(subsToAscii, ch)) {
                sub += subsToAscii[ch];
                continue;
            }
            if (Object.prototype.hasOwnProperty.call(supersToAscii, ch)) {
                sup += supersToAscii[ch];
                continue;
            }
            if ((ch === '+' || ch === '-') && sup) {
                sup += ch;
                continue;
            }
            base += ch;
        }
        let result = base;
        if (sub) {
            result += /^[0-9]+$/.test(sub) ? `_${sub}` : `_(${sub})`;
        }
        if (sup) {
            result += `^(${sup})`;
        }
        return result;
    };
    const formatChemicalFormula = (value = '') => {
        const raw = String(value ?? '').trim();
        if (!raw) {
            return '';
        }
        let i = 0;
        const len = raw.length;
        const tokens = [];
        let overallSup = '';
        const readGroup = () => {
            if (raw[i] === '{') {
                i++;
                let depth = 1;
                const startIndex = i;
                while (i < len && depth > 0) {
                    const ch = raw[i];
                    if (ch === '{') depth++;
                    else if (ch === '}') depth--;
                    i++;
                }
                return raw.slice(startIndex, i - 1).trim();
            }
            const startIndex = i;
            while (i < len && /[0-9+-]/.test(raw[i])) { i++; }
            return raw.slice(startIndex, i).trim();
        };

        while (i < len) {
            const ch = raw[i];
            if (ch === ' ') { i++; continue; }
            if (!/[A-Z]/.test(ch)) {
                return '';
            }
            let symbol = ch;
            i++;
            if (i < len && /[a-z]/.test(raw[i])) {
                symbol += raw[i];
                i++;
            }
            let sub = '';
            let sup = '';
            if (i < len && raw[i] === '_') {
                i++;
                sub = readGroup();
            }
            if (i < len && raw[i] === '^') {
                i++;
                sup = readGroup();
            }
            tokens.push({ symbol, sub, sup });
        }

        if (!tokens.length) {
            return '';
        }

        const supTokens = tokens.filter((t) => t.sup);
        if (supTokens.length === 1 && tokens.length > 1) {
            const last = tokens[tokens.length - 1];
            if (last.sup) {
                overallSup = last.sup;
                last.sup = '';
            }
        }

        const parts = tokens.map(({ symbol, sub, sup }) => {
            let part = symbol.length > 1 ? `〖${symbol}〗` : symbol;
            if (sub) {
                if (/^[0-9]+$/.test(sub)) {
                    part += `_${sub} `;  // Add space after numeric subscript
                } else {
                    part += `_(${sub})`;
                }
            }
            if (sup) {
                part += `^(${sup})`;
            }
            return part;
        });

        let inner = parts.join('');
        if (overallSup) {
            inner = inner.trim();
            inner += `^(${overallSup})`;
        }
        return `〖${inner}〗`;
    };

    const greekMap = {
        alpha: 'α',
        beta: 'β',
        gamma: 'γ',
        delta: 'δ',
        Delta: 'Δ',
        epsilon: 'ε',
        varepsilon: 'ε',
        vartheta: 'ϑ',
        theta: 'θ',
        Theta: 'Θ',
        kappa: 'κ',
        lambda: 'λ',
        Lambda: 'Λ',
        mu: 'μ',
        nu: 'ν',
        xi: 'ξ',
        Xi: 'Ξ',
        pi: 'π',
        Pi: 'Π',
        rho: 'ρ',
        sigma: 'σ',
        Sigma: 'Σ',
        tau: 'τ',
        upsilon: 'υ',
        Upsilon: 'Υ',
        phi: 'φ',
        Phi: 'Φ',
        varphi: 'ϕ',
        chi: 'χ',
        psi: 'ψ',
        Psi: 'Ψ',
        Gamma: 'Γ',
        Beta: 'Β',
        Alpha: 'Α',
        Mu: 'Μ',
        Rho: 'Ρ',
        Tau: 'Τ',
        omega: 'ω',
        Omega: 'Ω',
        zeta: 'ζ',
        eta: 'η'
    };
    const doubleStruck = {
        'A': '𝔸', 'B': '𝔹', 'C': 'ℂ', 'D': '𝔻', 'E': '𝔼', 'F': '𝔽', 'G': '𝔾',
        'H': 'ℍ', 'I': '𝕀', 'J': '𝕁', 'K': '𝕂', 'L': '𝕃', 'M': '𝕄', 'N': 'ℕ',
        'O': '𝕆', 'P': 'ℙ', 'Q': 'ℚ', 'R': 'ℝ', 'S': '𝕊', 'T': '𝕋', 'U': '𝕌',
        'V': '𝕍', 'W': '𝕎', 'X': '𝕏', 'Y': '𝕐', 'Z': 'ℤ',
        'a': '𝕒', 'b': '𝕓', 'c': '𝕔', 'd': '𝕕', 'e': '𝕖', 'f': '𝕗', 'g': '𝕘',
        'h': '𝕙', 'i': '𝕚', 'j': '𝕛', 'k': '𝕜', 'l': '𝕝', 'm': '𝕞', 'n': '𝕟',
        'o': '𝕠', 'p': '𝕡', 'q': '𝕢', 'r': '𝕣', 's': '𝕤', 't': '𝕥', 'u': '𝕦',
        'v': '𝕧', 'w': '𝕨', 'x': '𝕩', 'y': '𝕪', 'z': '𝕫',
        '0': '𝟘', '1': '𝟙', '2': '𝟚', '3': '𝟛', '4': '𝟜', '5': '𝟝',
        '6': '𝟞', '7': '𝟟', '8': '𝟠', '9': '𝟡'
    };
    const scriptMap = {
        'A': '𝒜', 'B': 'ℬ', 'C': '𝒞', 'D': '𝒟', 'E': 'ℰ', 'F': 'ℱ', 'G': '𝒢',
        'H': 'ℋ', 'I': 'ℐ', 'J': '𝒥', 'K': '𝒦', 'L': 'ℒ', 'M': 'ℳ', 'N': '𝒩',
        'O': '𝒪', 'P': '𝒫', 'Q': '𝒬', 'R': 'ℛ', 'S': '𝒮', 'T': '𝒯', 'U': '𝒰',
        'V': '𝒱', 'W': '𝒲', 'X': '𝒳', 'Y': '𝒴', 'Z': '𝒵',
        'a': '𝒶', 'b': '𝒷', 'c': '𝒸', 'd': '𝒹', 'e': 'ℯ', 'f': '𝒻', 'g': 'ℊ',
        'h': '𝒽', 'i': '𝒾', 'j': '𝒿', 'k': '𝓀', 'l': '𝓁', 'm': '𝓂', 'n': '𝓃',
        'o': 'ℴ', 'p': '𝓅', 'q': '𝓆', 'r': '𝓇', 's': '𝓈', 't': '𝓉', 'u': '𝓊',
        'v': '𝓋', 'w': '𝓌', 'x': '𝓍', 'y': '𝓎', 'z': '𝓏'
    };
    const frakturMap = {
        'A': '𝔄', 'B': '𝔅', 'C': 'ℭ', 'D': '𝔇', 'E': '𝔈', 'F': '𝔉', 'G': '𝔊',
        'H': '𝔋', 'I': '𝔌', 'J': '𝔍', 'K': '𝔎', 'L': '𝔏', 'M': '𝔐', 'N': '𝔑',
        'O': '𝔒', 'P': '𝔓', 'Q': '𝔔', 'R': 'ℜ', 'S': '𝔖', 'T': '𝔗', 'U': '𝔘',
        'V': '𝔙', 'W': '𝔚', 'X': '𝔛', 'Y': '𝔜', 'Z': 'ℨ',
        'a': '𝔞', 'b': '𝔟', 'c': '𝔠', 'd': '𝔡', 'e': '𝔢', 'f': '𝔣', 'g': '𝔤',
        'h': '𝔥', 'i': '𝔦', 'j': '𝔧', 'k': '𝔨', 'l': '𝔩', 'm': '𝔪', 'n': '𝔫',
        'o': '𝔬', 'p': '𝔭', 'q': '𝔮', 'r': '𝔯', 's': '𝔰', 't': '𝔱', 'u': '𝔲',
        'v': '𝔳', 'w': '𝔴', 'x': '𝔵', 'y': '𝔶', 'z': '𝔷'
    };
    const commandReplacements = [
        [/\\Longleftrightarrow/g, '⇔'],
        [/\\rightarrow\\rightleftharpoons/g, '⇌'],
        [/\\rightleftharpoons/g, ' ⇌ '],
        [/\\leftharpoons/g, '⇌'],
        [/\\longleftrightarrow/g, '⟷'],
        [/\\leftrightarrow/g, '↔'],
        [/\\Longrightarrow/g, '⇒'],
        [/\\Rightarrow/g, '⇒'],
        [/\\Longleftarrow/g, '⇐'],
        [/\\Leftarrow/g, '⇐'],
        [/\\longrightarrow/g, '→'],
        [/\\rightarrow/g, ' → '],
        [/\\to\b/g, '→'],
        [/\\longleftarrow/g, '←'],
        [/\\leftarrow/g, '←'],
        [/\\mapsto/g, '↦'],
        [/\\implies/g, '⇒'],
        [/\\iff/g, '⇔'],
        [/\\uparrow/g, '↑'],
        [/\\downarrow/g, '↓'],
        [/\\updownarrow/g, '↕'],
        [/\\rightleftharpoons/g, '⇌'],
        [/\\leftharpoondown/g, '↽'],
        [/\\rightharpoondown/g, '⇁'],
        [/\\leftharpoonup/g, '↼'],
        [/\\rightharpoonup/g, '⇀'],
        [/\\pm/g, '±'],
        [/\\mp/g, '∓'],
        [/\\times/g, '×'],
        [/\\cdot/g, '·'],
        [/\\div/g, '÷'],
        [/\\ast/g, '∗'],
        [/\\star/g, '⋆'],
        [/\\bullet/g, '•'],
        [/\\circ/g, '∘'],
        [/\\infty/g, '∞'],
        [/\\partial/g, '∂'],
        [/\\nabla/g, '∇'],
        [/\\iiint/g, '∭'],
        [/\\iint/g, '∬'],
        [/\\int/g, '∫'],
        [/\\sum/g, '∑'],
        [/\\prod/g, '∏'],
        [/\\oint/g, '∮'],
        [/\\therefore/g, '∴'],
        [/\\because/g, '∵'],
        [/\\angle/g, '∠'],
        [/\\approx/g, '≈'],
        [/\\simeq/g, '≃'],
        [/\\sim/g, '∼'],
        [/\\cong/g, '≅'],
        [/\\neq/g, '≠'],
        [/\\leqslant/g, '≤'],
        [/\\leq/g, '≤'],
        [/\\geqslant/g, '≥'],
        [/\\geq/g, '≥'],
        [/\\propto/g, '∝'],
        [/\\subseteq/g, '⊆'],
        [/\\supseteq/g, '⊇'],
        [/\\subset/g, '⊂'],
        [/\\supset/g, '⊃'],
        [/\\in/g, '∈'],
        [/\\notin/g, '∉'],
        [/\\ni/g, '∋'],
        [/\\cup/g, '∪'],
        [/\\cap/g, '∩'],
        [/\\setminus/g, '∖'],
        [/\\forall/g, '∀'],
        [/\\exists/g, '∃'],
        [/\\land/g, '∧'],
        [/\\lor/g, '∨'],
        [/\\neg/g, '¬'],
        [/\\cdots/g, '⋯'],
        [/\\ldots/g, '…'],
        [/\\dotsc/g, '…'],
        [/\\vdots/g, '⋮'],
        [/\\ddots/g, '⋱'],
        [/\\triangle/g, '△'],
        [/\\bigtriangleup/g, '△'],
        [/\\triangleleft/g, '◁'],
        [/\\triangleright/g, '▷'],
        [/\\langle/g, '⟨'],
        [/\\rangle/g, '⟩'],
        [/\\lfloor/g, '⌊'],
        [/\\rfloor/g, '⌋'],
        [/\\lceil/g, '⌈'],
        [/\\rceil/g, '⌉'],
        [/\\deg/g, '°'],
        [/\\triangleq/g, '≜'],
        [/\\equiv/g, '≡'],
        [/\\perp/g, '⊥'],
        [/\\parallel/g, '∥'],
        [/\\prime/g, '′'],
        [/\\emptyset/g, '∅'],
        [/\\aleph/g, 'ℵ'],
        [/\\Box/g, '□']
    ];

    function mapToChars(value, table) {
        return Array.from(value).map((char) => table[char] || char).join('');
    }

    function simplifyFunctions(value) {
        return value.replace(/\\(sin|cos|tan|csc|sec|cot|log|ln|exp|max|min|mod)\b/g, (_, fn) => fn);
    }

    function cleanSegment(segment, depth = 0) {
        if (depth > 5) {
            return segment ?? '';
        }
        let text = String(segment ?? '');
        if (!text) {
            return '';
        }

        text = text.replace(/\r\n?/g, '\n');

        const wordArrow = (arrow, labelSource) => {
            const cleanLabel = cleanSegment(labelSource, depth + 1).trim();
            if (!cleanLabel) {
                return ` ${arrow} `;
            }
            return ` □(${arrow}┴${cleanLabel} ) `;
        };

        text = text.replace(/\\xrightarrow\s*\{\s*([^}]*)\s*\}/g, (_, label) => wordArrow('→', label));
        text = text.replace(/\\xleftarrow\s*\{\s*([^}]*)\s*\}/g, (_, label) => wordArrow('←', label));
        text = text.replace(/\\xleftrightarrow\s*\{\s*([^}]*)\s*\}/g, (_, label) => wordArrow('↔', label));

        text = text.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, (_, num, den) => {
            const top = cleanSegment(num, depth + 1).trim();
            const bottom = cleanSegment(den, depth + 1).trim();
            if (!bottom) {
                return top;
            }
            return `${top}⁄${bottom}`;
        });
        text = text.replace(/\\sqrt\s*\[\s*([^\]]+)\s*\]\s*\{([^{}]+)\}/g, (_, degree, radicand) => {
            const n = cleanSegment(degree, depth + 1).trim();
            const inside = cleanSegment(radicand, depth + 1);
            return `^${n}√(${inside})`;
        });
        text = text.replace(/\\sqrt\s*\{([^{}]+)\}/g, (_, radicand) => {
            const inside = cleanSegment(radicand, depth + 1);
            return `√(${inside})`;
        });

        text = text.replace(/\\overline\s*\{([^{}]+)\}/g, (_, inner) => `${cleanSegment(inner, depth + 1)}̅`);
        text = text.replace(/\\bar\s*\{([^{}]+)\}/g, (_, inner) => `${cleanSegment(inner, depth + 1)}̄`);
        text = text.replace(/\\hat\s*\{([^{}]+)\}/g, (_, inner) => `${cleanSegment(inner, depth + 1)}̂`);
        text = text.replace(/\\tilde\s*\{([^{}]+)\}/g, (_, inner) => `${cleanSegment(inner, depth + 1)}̃`);
        text = text.replace(/\\vec\s*\{([^{}]+)\}/g, (_, inner) => `${cleanSegment(inner, depth + 1)}⃗`);
        text = text.replace(/\\underline\s*\{([^{}]+)\}/g, (_, inner) => `${cleanSegment(inner, depth + 1)}̲`);

        text = text.replace(/\\rightarrow\\rightleftharpoons/g, '⇌');
        text = text.replace(/\\rightleftharpoons/g, '⇌');
        text = text.replace(/\\leftharpoons/g, '⇌');
        text = text.replace(/\\left(?=\s*[\(\[\{])/g, '');
        text = text.replace(/\\right(?=\s*[\)\]\}])/g, '');
        text = text.replace(/\\!/g, '');
        text = text.replace(/\\quad|\\qquad/g, '    ');
        text = text.replace(/\\,|\\;|\\:|\\thinspace/g, ' ');
        text = text.replace(/~/g, ' ');
        text = text.replace(/\\%/g, '%').replace(/\\#/g, '#').replace(/\\&/g, '&');
        text = text.replace(/\\\{/g, '{').replace(/\\\}/g, '}');
        text = text.replace(/\\_/g, '_');

        text = text.replace(/\\text\s*\{([^}]*)\}/g, (_, value) => cleanSegment(value, depth + 1));
        text = text.replace(/\\mathrm\s*\{([^}]*)\}/g, (_, value) => cleanSegment(value, depth + 1));
        text = text.replace(/\\operatorname\s*\{([^}]*)\}/g, (_, value) => cleanSegment(value, depth + 1));

        text = text.replace(/\\mathbb\s*\{([^{}]+)\}/g, (_, value) => mapToChars(cleanSegment(value, depth + 1), doubleStruck));
        text = text.replace(/\\mathcal\s*\{([^{}]+)\}/g, (_, value) => mapToChars(cleanSegment(value, depth + 1), scriptMap));
        text = text.replace(/\\mathscr\s*\{([^{}]+)\}/g, (_, value) => mapToChars(cleanSegment(value, depth + 1), scriptMap));
        text = text.replace(/\\mathfrak\s*\{([^{}]+)\}/g, (_, value) => mapToChars(cleanSegment(value, depth + 1), frakturMap));
        text = text.replace(/\\mathbf\s*\{([^{}]+)\}/g, (_, value) => cleanSegment(value, depth + 1));
        text = text.replace(/\\mathit\s*\{([^{}]+)\}/g, (_, value) => cleanSegment(value, depth + 1));
        text = text.replace(/\\mathsf\s*\{([^{}]+)\}/g, (_, value) => cleanSegment(value, depth + 1));
        text = text.replace(/\\mathnormal\s*\{([^{}]+)\}/g, (_, value) => cleanSegment(value, depth + 1));
        const formatSpeciesState = (species, state) => {
            const stateLower = state.toLowerCase();
            const cleaned = cleanSegment(species, depth + 1).trim();
            if (!cleaned) {
                return `${species} (${stateLower})`;
            }
            const chemical = formatChemicalFormula(cleaned);
            if (chemical) {
                return `${chemical} (${stateLower})`;
            }
            if (/(_\(|\^\(|〖)/.test(cleaned)) {
                return `${cleaned} (${stateLower})`;
            }
            const formatted = formatWordSymbol(cleaned) || cleaned;
            return (formatted ? `〖${formatted}〗` : species) + ` (${stateLower})`;
        };

        text = text.replace(/([^\s]+)_(?:\{\s*)?\((aq|s|l|g)\)(?:\s*\})?/gi, (_, species, state) => formatSpeciesState(species, state));
        text = text.replace(/([^\s]+)_\(\((aq|s|l|g)\)\)/gi, (_, species, state) => formatSpeciesState(species, state));
        text = text.replace(/([^\s]+)\s*\\text\{\s*\(?(aq|s|l|g)\)?\s*\}/gi, (_, species, state) => formatSpeciesState(species, state));
        text = text.replace(/(〖[^〗]+〗|[A-Za-z0-9}{]+)\s*\((aq|s|l|g)\)/gi, (_, species, state) => formatSpeciesState(species, state));
        text = text.replace(/\\color\s*\{[^}]*\}/g, '');

        text = text.replace(/\\binom\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, (_, top, bottom) => `(${cleanSegment(top, depth + 1)} choose ${cleanSegment(bottom, depth + 1)})`);
        text = text.replace(/\\cfrac/g, '\\frac');
        text = text.replace(/\\choose/g, ' choose ');
        text = text.replace(/\\begin\s*\{[^}]*\}/g, '');
        text = text.replace(/\\end\s*\{[^}]*\}/g, '');
        text = text.replace(/&/g, ' ');

        text = text.replace(/\\\\/g, '\n');

        for (const [pattern, value] of commandReplacements) {
            text = text.replace(pattern, value);
        }

        text = text.replace(/→\s*⇌/g, '⇌');

        text = simplifyFunctions(text);

        text = text.replace(/\\([A-Za-z]+)/g, (match, name) => {
            if (Object.prototype.hasOwnProperty.call(greekMap, name)) {
                return greekMap[name];
            }
            return name;
        });

        text = text.replace(/\\placeholder\{[^}]*\}/g, '□');

        // Keep superscripts in LaTeX format - no Unicode conversion
        text = text.replace(/\^\{([^{}]+)\}/g, (_, content) => `^(${cleanSegment(content, depth + 1)})`);
        text = text.replace(/\^(\+|\-|[a-zA-Z]+[+\-]?|\d+[a-zA-Z]*[+\-]?)/g, (_, token) => `^${token}`);
        
        // Handle {Element}_subscript patterns - add space between groups
        text = text.replace(/\{([A-Z][a-z]?)\}_(\{[^}]+\}|\d+)/g, (match, element, sub) => {
            const cleanSub = sub.startsWith('{') ? sub.slice(1, -1) : sub;
            return `{${element}}_${cleanSub} `;
        });
        
        text = text.replace(/_(\{([^{}]+)\}|((?!\(\()[A-Za-z0-9+\-()=]))(\s?)/g, (match, _whole, braced, single, trailingSpace) => {
            const inner = braced ? braced : single;
            const plain = cleanSegment(inner, depth + 1);
            if (plain === '(' || plain === ')') {
                return match;
            }
            // Keep subscripts in LaTeX format - no Unicode conversion
            // Add space after numeric subscripts for better readability
            const shouldAddSpace = /^\d+$/.test(plain);
            return `_${plain}${shouldAddSpace ? ' ' : trailingSpace}`;
        });
        // Unicode conversion disabled - these patterns are no longer needed
        
        // Handle isotope notation: _subscript ^superscript Element -> (_subscript^superscript)Element
        text = text.replace(/_([A-Za-z0-9+\-]+)\s*\^([A-Za-z0-9+\-]+)\s*([A-Z][a-z]?)/g, '(_$1^$2)$3');

        text = text.replace(/[{}]/g, '');
        text = text.replace(/\s+\n/g, '\n').replace(/\n\s+/g, '\n');
        // Keep multiple spaces - don't collapse them
        // text = text.replace(/[ \t]+/g, ' ');
        return text.trim();
    }

    return cleanSegment(latex);
}

function syncFromMath(){
  if (isApplyingAutoReplacements) return;

  let val = mathField.getValue('latex') || '';

  const ionAdjusted = convertPolyatomicIons(val, null);
  const stateAdjusted = normalizeStateAnnotations(ionAdjusted.text, ionAdjusted.caret);
  const finalVal = stateAdjusted.text;

  if (finalVal !== val) {
    isApplyingAutoReplacements = true;
    mathField.setValue(finalVal);
    isApplyingAutoReplacements = false;
  }

  rawLatex = finalVal;
  const displayVal = finalVal.replace(/\\!/g, '');
  textArea.value = displayVal;
  wordOutput.value = toWordEquation(rawLatex);
  previewDiv.innerHTML = '$$' + displayVal + '$$';
  typesetMath();
}

function syncFromText(){
  let val = textArea.value;
  let caret = textArea.selectionStart;

  let result = convertPolyatomicIons(val, caret);
  val = result.text;
  caret = result.caret;

  result = normalizeStateAnnotations(val, caret);
  val = result.text;
  caret = result.caret;

  if (val !== textArea.value) {
    textArea.value = val;
    if (typeof caret === 'number') {
      textArea.setSelectionRange(caret, caret);
    }
  }

  // Auto-wrap single capital letters (optionally followed by lowercase) before subscripts/superscripts
  // This converts patterns like "A_1" to "{A}_1" and "Ca_2" to "{Ca}_2"
  val = val.replace(/\b([A-Z][a-z]?)(?=[\^_])/g, '{$1}');
  if (textArea.value !== val) {
    textArea.value = val;
  }
  
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
      // Match states like \text{(s)}, _{(s)}, _((s)), or plain (s)
      const stateMatch =
        beforeCursor.match(/(\\,)?\\text\{\s*\(?(?:s|l|g|aq)\)?\s*\}$/i) ||
        beforeCursor.match(/\\mathrm\{\s*\(?(?:s|l|g|aq)\)?\s*\}$/i) ||
        beforeCursor.match(/_\{\\?\(?(?:s|l|g|aq)\)?\}$/i) ||
        beforeCursor.match(/_\(\((?:s|l|g|aq)\)\)$/i) ||
        beforeCursor.match(/\s*\((?:s|l|g|aq)\)\s*$/i);
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
      // Match states like \text{(s)}, _{(s)}, _((s)), or plain (s)
      const stateMatch =
        afterCursor.match(/^(\\,)?\\text\{\s*\(?(?:s|l|g|aq)\)?\s*\}/i) ||
        afterCursor.match(/^\\mathrm\{\s*\(?(?:s|l|g|aq)\)?\s*\}/i) ||
        afterCursor.match(/^_\{\\?\(?(?:s|l|g|aq)\)?\}/i) ||
        afterCursor.match(/^_\(\((?:s|l|g|aq)\)\)/i) ||
        afterCursor.match(/^\s*\((?:s|l|g|aq)\)\s*/i);
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
    const stateMatch =
      beforeCursor.match(/(\\,)?\\text\{\s*\(?(?:s|l|g|aq)\)?\s*\}$/i) ||
      beforeCursor.match(/\\mathrm\{\s*\(?(?:s|l|g|aq)\)?\s*\}$/i) ||
      beforeCursor.match(/_\{\\?\(?(?:s|l|g|aq)\)?\}$/i) ||
      beforeCursor.match(/_\(\((?:s|l|g|aq)\)\)$/i) ||
      beforeCursor.match(/\s*\((?:s|l|g|aq)\)\s*$/i);
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
    const stateMatch =
      afterCursor.match(/^(\\,)?\\text\{\s*\(?(?:s|l|g|aq)\)?\s*\}/i) ||
      afterCursor.match(/^\\mathrm\{\s*\(?(?:s|l|g|aq)\)?\s*\}/i) ||
      afterCursor.match(/^_\{\\?\(?(?:s|l|g|aq)\)?\}/i) ||
      afterCursor.match(/^_\(\((?:s|l|g|aq)\)\)/i) ||
      afterCursor.match(/^\s*\((?:s|l|g|aq)\)\s*/i);
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
  const normalized = String(state || '').toLowerCase();
  mathField.insert(` (${normalized})`);
  syncFromMath();
}

function insertText(text){ mathField.insert(text); syncFromMath(); }

const chemKeys = [
  { display: '\\rightarrow', insert: ' \\rightarrow ' },
  { display: '\\rightleftharpoons', insert: ' \\rightleftharpoons ' },
  { display: '\\xrightarrow{\\placeholder{}}', insert: ' \\xrightarrow{\\placeholder{}\\!} ' },
  { display: '(s)', insert: ' (s)' },
  { display: '(l)', insert: ' (l)' },
  { display: '(g)', insert: ' (g)' },
  { display: '(aq)', insert: ' (aq)' },
  { display: '{\\placeholder{}}^{\\placeholder{}}(aq)', insert: '{\\placeholder{}\\!}^{\\placeholder{}} (aq)' },
  { display: '{\\placeholder{}}^{\\placeholder{}}', insert: '{\\placeholder{}\\!}^{\\placeholder{}}' },
  { display: '\\xrightarrow{\\Delta}', insert: ' \\xrightarrow{\\Delta} ' },
  { display: '^{\\placeholder{}}_{\\placeholder{}}\\placeholder{}', insert: '^{\\placeholder{}}_{\\placeholder{}}\\placeholder{}' },
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
