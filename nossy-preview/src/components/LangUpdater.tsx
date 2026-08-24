"use client";

import { useEffect } from 'react';

export default function LangUpdater({ lang }: { lang: string }) {
  useEffect(() => {
    const map: Record<string, string> = {
      'pt-br': 'pt-BR', 'pt-pt': 'pt-PT', 'zh': 'zh-CN',
      'en': 'en', 'es': 'es', 'fr': 'fr', 'de': 'de', 'it': 'it',
      'nl': 'nl', 'pl': 'pl', 'ru': 'ru', 'ja': 'ja', 'ko': 'ko',
      'hi': 'hi', 'bn': 'bn', 'ar': 'ar', 'tr': 'tr', 'vi': 'vi',
      'th': 'th', 'ur': 'ur', 'tl': 'tl', 'sw': 'sw',
    };
    document.documentElement.lang = map[lang] || lang;
  }, [lang]);
  return null;
}
