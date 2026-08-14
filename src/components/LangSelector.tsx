"use client";

import React, { useState, useRef, useEffect } from 'react';
import { LANGUAGES, type Lang } from '@/lib/i18n';

export default function LangSelector({ lang, switchLang }: { lang: Lang; switchLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={current.name}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:border-sky-300 hover:shadow-sm transition-all text-sm font-medium text-gray-700 cursor-pointer min-w-[140px] justify-between"
      >
        <span className="flex items-center gap-1.5">
          <span className="text-base">{current.flag}</span>
          <span className="hidden sm:inline">{current.name}</span>
        </span>
        <svg className={"w-4 h-4 text-gray-400 transition-transform " + (open ? "rotate-180" : "")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div role="listbox" aria-label="Select language" className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[200] max-h-80 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Idioma</div>
          {LANGUAGES.map((l) => {
            const isActive = l.code === lang;
            return (
              <button
                key={l.code}
                role="option"
                aria-selected={isActive}
                onClick={() => { switchLang(l.code); setOpen(false); }}
                className={"w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors " +
                  (isActive
                    ? "bg-sky-50 text-sky-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50")}
              >
                <span className="text-lg">{l.flag}</span>
                <span className="flex-1">{l.name}</span>
                {isActive && <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
