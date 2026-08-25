"use client";

import { useEffect } from 'react';

/**
 * Sets <html lang="..."> and <html dir="..."> dynamically.
 * Included in [lang]/[slug]/layout.tsx so it runs on ALL pages.
 */
export default function LangUpdater({ lang }: { lang: string }) {
  useEffect(() => {
    const langMap: Record<string, string> = {
      'pt-br': 'pt-BR', 'pt-pt': 'pt-PT', 'zh': 'zh-CN',
      'en': 'en', 'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE', 'it': 'it-IT',
      'nl': 'nl-NL', 'pl': 'pl-PL', 'ru': 'ru-RU', 'ja': 'ja', 'ko': 'ko',
      'hi': 'hi', 'bn': 'bn', 'ar': 'ar', 'tr': 'tr-TR', 'vi': 'vi',
      'th': 'th', 'ur': 'ur', 'tl': 'tl', 'sw': 'sw',
    };
    document.documentElement.lang = langMap[lang] || lang;
    document.documentElement.dir = (lang === 'ar' || lang === 'ur') ? 'rtl' : 'ltr';
  }, [lang]);
  return null;
}
