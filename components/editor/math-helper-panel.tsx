import React, { useState, useMemo } from 'react';
import { IconCheck, IconX, IconSearch } from '@tabler/icons-react';
import { KatexPreview } from './katex-preview';

export type MathHelperPanelProps = {
  isMathHelperOpen: boolean;
  setIsMathHelperOpen: (open: boolean) => void;
  language: string;
  showRightSidebar: boolean;
  isRightSidebarExpanded: boolean;
};

export function MathHelperPanel({
  isMathHelperOpen,
  setIsMathHelperOpen,
  language,
  showRightSidebar,
  isRightSidebarExpanded
}: MathHelperPanelProps) {
    const [mathToast, setMathToast] = useState<string | null>(null);  
    const [dashboardExpandedProjects, setDashboardExpandedProjects] = useState<Record<string, boolean>>({});  
    const [isDarkMode, setIsDarkMode] = useState(false);  
    const [mounted, setMounted] = useState(false);  
    
    useEffect(() => {  
      setMounted(true);  
    }, []);  
    
    useEffect(() => {  
      if (activeSidebarTab) {  
        setShowRightSidebar(true);  
      }  
    }, [activeSidebarTab]);  
    
    const [activeMathCategory, setActiveMathCategory] = useState<'all' | 'general' | 'greek' | 'operators' | 'advanced' | 'structures'>('general');  
    const [mathSearchQuery, setMathSearchQuery] = useState('');  
    
    const mathHelperItems = useMemo(() => [  
      // 1. General  
      { label: language === 'en' ? 'Fraction' : 'Pecahan', code: '\\frac{a}{b}', category: 'general', isLong: false },  
      { label: language === 'en' ? 'Square Root' : 'Akar Kuadrat', code: '\\sqrt{x}', category: 'general', isLong: false },  
      { label: language === 'en' ? 'N-th Root' : 'Akar Pangkat N', code: '\\sqrt[n]{x}', category: 'general', isLong: false },  
      { label: language === 'en' ? 'Brackets' : 'Kurung Kunci', code: '\\left( x \\right)', category: 'general', isLong: true },  
      { label: language === 'en' ? 'Subscript' : 'Subskrip', code: 'x_{i}', category: 'general', isLong: false },  
      { label: language === 'en' ? 'Superscript' : 'Superskrip', code: 'x^{2}', category: 'general', isLong: false },  
      { label: language === 'en' ? 'Sub & Super' : 'Sub & Super', code: 'x_{i}^{2}', category: 'general', isLong: true },  
      { label: language === 'en' ? 'Vector' : 'Vektor', code: '\\vec{x}', category: 'general', isLong: false },  
      { label: language === 'en' ? 'Hat' : 'Hat', code: '\\hat{x}', category: 'general', isLong: false },  
      { label: language === 'en' ? 'Average (Bar)' : 'Rata-rata', code: '\\bar{x}', category: 'general', isLong: false },  
      { label: language === 'en' ? 'Regular Text' : 'Teks Biasa', code: '\\text{teks}', category: 'general', isLong: false },  
      { label: language === 'en' ? 'Bold Text' : 'Teks Tebal (Bold)', code: '\\mathbf{x}', category: 'general', isLong: false },  
      { label: language === 'en' ? 'Calligraphic (Cal)' : 'Kaligrafi (Cal)', code: '\\mathcal{L}', category: 'general', isLong: false },  
      { label: language === 'en' ? 'Real Numbers (R)' : 'Bilangan Riil (R)', code: '\\mathbb{R}', category: 'general', isLong: false },  
      { label: language === 'en' ? 'Integers (Z)' : 'Bilangan Bulat (Z)', code: '\\mathbb{Z}', category: 'general', isLong: false },  
      { label: language === 'en' ? 'Complex Numbers (C)' : 'Bilangan Kompleks (C)', code: '\\mathbb{C}', category: 'general', isLong: false },  
      { label: language === 'en' ? 'Natural Numbers (N)' : 'Bilangan Asli (N)', code: '\\mathbb{N}', category: 'general', isLong: false },  
    
      // 2. Greek  
      { label: 'Alpha (α)', code: '\\alpha', category: 'greek', isLong: false },  
      { label: 'Beta (β)', code: '\\beta', category: 'greek', isLong: false },  
      { label: 'Gamma (γ)', code: '\\gamma', category: 'greek', isLong: false },  
      { label: 'Delta (δ)', code: '\\delta', category: 'greek', isLong: false },  
      { label: 'Delta (Δ)', code: '\\Delta', category: 'greek', isLong: false },  
      { label: 'Theta (θ)', code: '\\theta', category: 'greek', isLong: false },  
      { label: 'Theta (Θ)', code: '\\Theta', category: 'greek', isLong: false },  
      { label: 'Lambda (λ)', code: '\\lambda', category: 'greek', isLong: false },  
      { label: 'Lambda (Λ)', code: '\\Lambda', category: 'greek', isLong: false },  
      { label: 'Sigma (σ)', code: '\\sigma', category: 'greek', isLong: false },  
      { label: 'Sigma (Σ)', code: '\\Sigma', category: 'greek', isLong: false },  
      { label: 'Pi (π)', code: '\\pi', category: 'greek', isLong: false },  
      { label: 'Phi (φ)', code: '\\phi', category: 'greek', isLong: false },  
      { label: 'Phi (Φ)', code: '\\Phi', category: 'greek', isLong: false },  
      { label: 'Omega (ω)', code: '\\omega', category: 'greek', isLong: false },  
      { label: 'Omega (Ω)', code: '\\Omega', category: 'greek', isLong: false },  
      { label: 'Mu (μ)', code: '\\mu', category: 'greek', isLong: false },  
      { label: 'Epsilon (ε)', code: '\\epsilon', category: 'greek', isLong: false },  
      { label: 'Rho (ρ)', code: '\\rho', category: 'greek', isLong: false },  
      { label: 'Tau (τ)', code: '\\tau', category: 'greek', isLong: false },  
      { label: 'Psi (ψ)', code: '\\psi', category: 'greek', isLong: false },  
      { label: 'Psi (Ψ)', code: '\\Psi', category: 'greek', isLong: false },  
      { label: 'Eta (η)', code: '\\eta', category: 'greek', isLong: false },  
      { label: 'Kappa (κ)', code: '\\kappa', category: 'greek', isLong: false },  
    
      // 3. Operators & Logic  
      { label: language === 'en' ? 'Plus-Minus (±)' : 'Kurang Lebih (±)', code: '\\pm', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Multiply (Dot ·)' : 'Kali (Dot ·)', code: '\\cdot', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Multiply (Cross ×)' : 'Kali (Cross ×)', code: '\\times', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Not Equal To (≠)' : 'Tidak Sama Dengan (≠)', code: '\\neq', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Approximately (≈)' : 'Mendekati (≈)', code: '\\approx', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Less Than or Equal (≤)' : 'Kurang Dari (≤)', code: '\\le', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Greater Than or Equal (≥)' : 'Lebih Dari (≥)', code: '\\ge', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Proportional (∝)' : 'Proporsional (∝)', code: '\\propto', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'For All (∀)' : 'Untuk Semua (∀)', code: '\\forall', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Exists (∃)' : 'Ada (∃)', code: '\\exists', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Element Of (∈)' : 'Anggota Dari (∈)', code: '\\in', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Not Element Of (∉)' : 'Bukan Anggota (∉)', code: '\\notin', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Infinity (∞)' : 'Tak Terhingga (∞)', code: '\\infty', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Right Arrow (→)' : 'Panah Kanan (→)', code: '\\to', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Left Arrow (←)' : 'Panah Kiri (←)', code: '\\gets', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Double Arrow (⇒)' : 'Panah Ganda (⇒)', code: '\\Rightarrow', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Double Left-Right Arrow (⇔)' : 'Panah Ganda Kiri-Kanan (⇔)', code: '\\Leftrightarrow', category: 'operators', isLong: true },  
      { label: language === 'en' ? 'Union (∪)' : 'Gabungan (Union ∪)', code: '\\cup', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Intersection (∩)' : 'Irisan (Intersect ∩)', code: '\\cap', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Empty Set (Ø)' : 'Himpunan Kosong (Ø)', code: '\\emptyset', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Equivalent (≡)' : 'Ekuivalen (≡)', code: '\\equiv', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Tensor Product (⊗)' : 'Kali Tensor (⊗)', code: '\\otimes', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Direct Sum (⊕)' : 'Tambah Langsung (⊕)', code: '\\oplus', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Subset Of (⊆)' : 'Bagian Dari (⊆)', code: '\\subseteq', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Logical AND (∧)' : 'Logika DAN (∧)', code: '\\land', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Logical OR (∨)' : 'Logika ATAU (∨)', code: '\\lor', category: 'operators', isLong: false },  
      { label: language === 'en' ? 'Negation (¬)' : 'Negasi (¬)', code: '\\neg', category: 'operators', isLong: false },  
    
      // 4. Advanced Math  
      { label: 'Integral', code: '\\int_{a}^{b} f(x) dx', category: 'advanced', isLong: true },  
      { label: language === 'en' ? 'Double Integral' : 'Integral Ganda', code: '\\iint_{D} f(x,y) dA', category: 'advanced', isLong: true },  
      { label: language === 'en' ? 'Triple Integral' : 'Integral Lipat Tiga', code: '\\iiint_{V} f(x,y,z) dV', category: 'advanced', isLong: true },  
      { label: language === 'en' ? 'Contour Integral' : 'Integral Lintasan (O)', code: '\\oint_{C} f(z) dz', category: 'advanced', isLong: true },  
      { label: language === 'en' ? 'Summation (Sigma)' : 'Sigma (Sum)', code: '\\sum_{i=1}^{n} x_i', category: 'advanced', isLong: true },  
      { label: language === 'en' ? 'Product' : 'Produk (Product)', code: '\\prod_{i=1}^{n} x_i', category: 'advanced', isLong: true },  
      { label: 'Limit', code: '\\lim_{x \\to \\infty}', category: 'advanced', isLong: true },  
      { label: language === 'en' ? 'Partial Derivative' : 'Turunan Parsial', code: '\\partial', category: 'advanced', isLong: false },  
      { label: language === 'en' ? 'Nabla / Gradient' : 'Nabla/Gradien', code: '\\nabla', category: 'advanced', isLong: false },  
      { label: language === 'en' ? 'Logarithm' : 'Logaritma', code: '\\log_{b}(x)', category: 'advanced', isLong: false },  
      { label: language === 'en' ? 'Natural Logarithm' : 'Logaritma Natural', code: '\\ln(x)', category: 'advanced', isLong: false },  
      { label: language === 'en' ? 'Derivative Fraction' : 'Turunan Pecahan', code: '\\frac{dy}{dx}', category: 'advanced', isLong: false },  
      { label: language === 'en' ? 'Partial Derivative Fraction' : 'Turunan Parsial Pecahan', code: '\\frac{\\partial y}{\\partial x}', category: 'advanced', isLong: true },  
      { label: language === 'en' ? 'Second Derivative Fraction' : 'Turunan Kedua Pecahan', code: '\\frac{d^2 y}{dx^2}', category: 'advanced', isLong: true },  
      { label: language === 'en' ? 'Sine (sin)' : 'Sinus (sin)', code: '\\sin(x)', category: 'advanced', isLong: false },  
      { label: language === 'en' ? 'Cosine (cos)' : 'Kosinus (cos)', code: '\\cos(x)', category: 'advanced', isLong: false },  
      { label: language === 'en' ? 'Tangent (tan)' : 'Tangen (tan)', code: '\\tan(x)', category: 'advanced', isLong: false },  
      { label: language === 'en' ? 'Arcsine (arcsin)' : 'Arc Sinus (arcsin)', code: '\\arcsin(x)', category: 'advanced', isLong: false },  
      { label: language === 'en' ? 'Arccosine (arccos)' : 'Arc Kosinus (arccos)', code: '\\arccos(x)', category: 'advanced', isLong: false },  
      { label: language === 'en' ? 'Arctangent (arctan)' : 'Arc Tangen (arctan)', code: '\\arctan(x)', category: 'advanced', isLong: false },  
      { label: language === 'en' ? 'Divergence' : 'Divergensi', code: '\\nabla \\cdot \\vec{F}', category: 'advanced', isLong: false },  
      { label: language === 'en' ? 'Curl (Rotation)' : 'Curl (Rotasi)', code: '\\nabla \\times \\vec{F}', category: 'advanced', isLong: false },  
      { label: 'Laplacian', code: '\\nabla^2 f', category: 'advanced', isLong: false },  
    
      // 5. Structures  
      { label: language === 'en' ? '2x2 Matrix' : 'Matriks 2x2', code: '\\begin{matrix} a & b \\\\ c & d \\end{matrix}', category: 'structures', isLong: true },  
      { label: language === 'en' ? '3x3 Matrix' : 'Matriks 3x3', code: '\\begin{matrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{matrix}', category: 'structures', isLong: true },  
      { label: language === 'en' ? 'Parenthesized Matrix' : 'Matriks Tanda Kurung', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', category: 'structures', isLong: true },  
      { label: language === 'en' ? 'System of Equations (Cases)' : 'Sistem Persamaan (Cases)', code: 'f(x) = \\begin{cases} x & x \\ge 0 \\\\ -x & x < 0 \\end{cases}', category: 'structures', isLong: true }  
    ], [language]);  
    
    const filteredMathHelperItems = useMemo(() => {  
      let items = mathHelperItems;  
      if (mathSearchQuery.trim()) {  
        const q = mathSearchQuery.toLowerCase();  
        items = items.filter(item =>  
          item.label.toLowerCase().includes(q) ||  
          item.code.toLowerCase().includes(q)  
        );  
      } else if (activeMathCategory !== 'all') {  
        items = items.filter(item => item.category === activeMathCategory);  
      }  
      return items;  
    }, [mathHelperItems, activeMathCategory, mathSearchQuery]);  

  return (
    <>
                {isMathHelperOpen && (      
                  <div      
                    className={`fixed ${showRightSidebar ? (isRightSidebarExpanded ? 'right-[380px]' : 'right-20') : 'right-4'} top-40 w-80 bg-white/95 border border-slate-200/80 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-50 p-4 flex flex-col gap-3 h-[500px] max-h-[60vh] animate-fade-in`}      
                  >      
                    {/* Math Helper Toast notification inside the helper panel */}      
                    {mathToast && (      
                      <div className="absolute top-2 right-4 bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-md animate-fade-in flex items-center gap-1 z-20">      
                        <IconCheck className="h-3 w-3 text-emerald-400" />      
                        <span>{mathToast}</span>      
                      </div>      
                    )}      
            
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">      
                      <div className="flex flex-col">      
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">LaTeX Math Helper</span>      
                        <span className="text-[9px] text-slate-400 italic">      
                          {language === 'en' ? 'Quick Formula Shortcuts' : 'Pintasan Rumus Cepat'}      
                        </span>      
                      </div>      
                      <button      
                        type="button"      
                        onClick={() => setIsMathHelperOpen(false)}      
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"      
                        title={language === 'en' ? 'Close Panel' : 'Tutup Panel'}      
                      >      
                        <IconX className="h-4.5 w-4.5" />      
                      </button>      
                    </div>      
            
                    {/* Search Input Box */}      
                    <div className="relative">      
                      <input      
                        type="text"      
                        value={mathSearchQuery}      
                        onChange={(e) => setMathSearchQuery(e.target.value)}      
                        placeholder={language === 'en' ? 'Search symbol (e.g. sigma, integral)...' : 'Cari simbol (misal: sigma, integral)...'}      
                        className="w-full pl-8 pr-3 py-1.5 text-[10px] border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition font-sans text-slate-800"      
                      />      
                      <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />      
                      {mathSearchQuery && (      
                        <button      
                          type="button"      
                          onClick={() => setMathSearchQuery('')}      
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-semibold"      
                        >      
                          Clear      
                        </button>      
                      )}      
                    </div>      
            
                    {/* Category Tabs (Horizontal Scrollable) */}      
                    {!mathSearchQuery && (      
                      <div      
                        className="flex flex-wrap items-center gap-1 py-1.5 border-b border-slate-100 text-xs font-semibold text-slate-500"      
                      >      
                        {[      
                          { id: 'general', label: language === 'en' ? 'General' : 'Umum' },      
                          { id: 'greek', label: language === 'en' ? 'Greek' : 'Yunani' },      
                          { id: 'operators', label: language === 'en' ? 'Operators' : 'Operator' },      
                          { id: 'advanced', label: language === 'en' ? 'Calculus' : 'Kalkulus' },      
                          { id: 'structures', label: language === 'en' ? 'Structures' : 'Struktur' },      
                          { id: 'all', label: language === 'en' ? 'All' : 'Semua' }      
                        ].map(tab => (      
                          <button      
                            key={tab.id}      
                            type="button"      
                            onMouseDown={(e) => e.preventDefault()}      
                            onClick={() => setActiveMathCategory(tab.id as any)}      
                            className={`px-2 py-1 rounded transition shrink-0 cursor-pointer ${activeMathCategory === tab.id      
                              ? 'bg-indigo-50 text-indigo-700 font-bold'      
                              : 'hover:bg-slate-100 hover:text-slate-700'      
                              }`}      
                          >      
                            {tab.label}      
                          </button>      
                        ))}      
                      </div>      
                    )}      
            
                    <div className="overflow-y-auto flex-1 pr-1">      
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">      
                        <div className="col-span-2 text-[9px] bg-slate-50/50 p-2 rounded border border-slate-100 leading-normal mb-1">      
                          {language === 'en' ? (      
                            <>📌 <strong className="text-slate-600">Info:</strong> If the formula input box is active, clicking a formula will insert it directly. Otherwise, it will be copied to clipboard.</>      
                          ) : (      
                            <>📌 <strong className="text-slate-600">Info:</strong> Jika kotak input rumus aktif, mengklik rumus akan langsung menyisipkannya. Jika tidak, rumus disalin ke clipboard.</>      
                          )}      
                        </div>      
                        {filteredMathHelperItems.length === 0 ? (      
                          <div className="col-span-2 text-center py-6 text-slate-400 italic">      
                            {language === 'en' ? 'No matching symbols.' : 'Tidak ada simbol yang cocok.'}      
                          </div>      
                        ) : (      
                          filteredMathHelperItems.map((item) => (      
                            <button      
                              key={item.code}      
                              type="button"      
                              onMouseDown={(e) => e.preventDefault()} // Prevents losing editor focus      
                              onClick={async () => {      
                                const activeEl = document.activeElement as HTMLElement | null;      
                                const isMathTextarea = activeEl &&      
                                  activeEl.tagName === 'TEXTAREA' &&      
                                  (activeEl as HTMLTextAreaElement).placeholder?.includes('LaTeX formula');      
            
                                if (isMathTextarea) {      
                                  const txtEl = activeEl as HTMLTextAreaElement;      
                                  const start = txtEl.selectionStart;      
                                  const end = txtEl.selectionEnd;      
                                  const textVal = txtEl.value;      
                                  txtEl.value = textVal.substring(0, start) + item.code + textVal.substring(end);      
                                  txtEl.selectionStart = txtEl.selectionEnd = start + item.code.length;      
                                  txtEl.dispatchEvent(new InputEvent('input', { bubbles: true }));      
            
                                  setMathToast(language === 'en' ? 'Inserted!' : 'Disisipkan!');      
                                  setTimeout(() => setMathToast(null), 2000);      
                                } else {      
                                  try {      
                                    await navigator.clipboard.writeText(item.code);      
                                    setMathToast(language === 'en' ? 'Copied!' : 'Disalin!');      
                                    setTimeout(() => setMathToast(null), 2000);      
                                  } catch (err) {      
                                    console.error('Failed to copy text:', err);      
                                  }      
                                }      
                              }}      
                              className={`p-2.5 rounded border border-slate-200/80 hover:border-indigo-300 bg-white hover:bg-indigo-50/40 text-left transition cursor-pointer flex items-center justify-between gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-sm ${item.isLong ? 'col-span-2' : 'col-span-1'}`}      
                              title={item.code}      
                            >      
                              <div className="flex flex-col min-w-0 flex-1">      
                                <span className="font-semibold text-slate-750 text-[10px]">{item.label}</span>      
                                <span className="font-mono text-[8.5px] text-slate-400 truncate w-full mt-0.5">{item.code}</span>      
                              </div>      
                              <div className="flex-shrink-0 bg-slate-50 border border-slate-100/70 rounded px-1.5 py-1 min-h-[26px] flex items-center justify-center min-w-[36px]">      
                                <KatexPreview formula={item.code} />      
                              </div>      
                            </button>      
                          ))      
                        )}      
                      </div>      
                    </div>      
                  </div>      
                )}      
    </>
  );
}