"use client";

import { useEffect } from 'react';

/**
 * Sets <html lang="..."> dynamically based on the current page language.
 * The root layout defaults to lang="en", so this component overrides it
 * for non-English pages. Googlebot executes JavaScript, so this works for SEO.
 */
export default function LangUpdater({ lang }: { lang: string }) {
  useEffect(() => {
    const map: Record<string, string> = {
      'pt-br': 'pt-BR', 'pt-pt': 'pt-PT', 'zh': 'zh-CN',
      'en': 'en', 'es': 'es', 'fr': 'fr', 'de': 'de', 'it': 'it',
      'nl': 'nl', 'pl': 'pl', 'ru': 'ru', 'ja': 'ja', 'ko': 'ko',
      'hi': 'hi', 'bn': 'bn', 'ar': 'ar', 'tr': 'tr', 'vi': 'vi',
      'th': 'th', 'ur': 'ur', 'tl': 'tl', 'sw': 'sw',
    };
    const htmlLang = map[lang] || lang;
    document.documentElement.lang = htmlLang;
  }, [lang]);
  return null;
}