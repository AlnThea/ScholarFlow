'use client';

import React, { useEffect, useRef } from 'react';
import 'katex/dist/katex.min.css';

export const KatexPreview = ({ formula }: { formula: string }) => {
  const containerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    try {
      import('katex').then((kateMod) => {
        const katex = kateMod.default;
        if (containerRef.current) {
          katex.render(formula, containerRef.current, {
            displayMode: false,
            throwOnError: false
          });
        }
      });
    } catch (e) {
      if (containerRef.current) {
        containerRef.current.textContent = formula;
      }
    }
  }, [formula]);

  return <span ref={containerRef} className="text-slate-800 text-[11px] font-serif inline-block" />;
};
