"use client";

import React, { useState } from 'react';
import type { Lang } from '@/lib/i18n';

const PRICES: Record<string, { amount: number; label: string; popular?: boolean }> = {
  single: { amount: 2.99, label: 'singleJob' },
  pack5: { amount: 9.99, label: 'pack5' },
  pack10: { amount: 17.99, label: 'pack10', popular: true },
  unlimited: { amount: 49.99, label: 'unlimited' },
};

const LABELS: Record<string, Record<string, string>> = {
  en: {
    title: 'Unlock Contact Details', subtitle: 'Get exclusive access to employer contact information',
    singleJob: '1 Job Contact', pack5: '5 Contacts Pack', pack10: '10 Contacts Pack', unlimited: '30-Day Unlimited',
    cta: 'Unlock Now', close: 'Close', secure: 'Secure payment via Stripe',
    perJob: '/job', feature1: 'Direct company email', feature2: 'Full job description', feature3: 'Priority application support',
    mostPopular: 'Most Popular',
  },
  "pt-br": {
    title: 'Desbloqueie Contatos', subtitle: 'Acesse informações exclusivas de contato das empresas',
    singleJob: '1 Contato', pack5: 'Pacote 5 Contatos', pack10: 'Pacote 10 Contatos', unlimited: 'Acesso Ilimitado 30 dias',
    cta: 'Desbloquear Agora', close: 'Fechar', secure: 'Pagamento seguro via Stripe',
    perJob: '/vaga', feature1: 'Email direto da empresa', feature2: 'Descrição completa da vaga', feature3: 'Suporte prioritário na candidatura',
    mostPopular: 'Mais Popular',
  },
  es: {
    title: 'Desbloquear Contactos', subtitle: 'Acceda a información exclusiva de contacto',
    singleJob: '1 Contacto', pack5: 'Pack 5 Contactos', pack10: 'Pack 10 Contactos', unlimited: 'Ilimitado 30 días',
    cta: 'Desbloquear', close: 'Cerrar', secure: 'Pago seguro con Stripe',
    perJob: '/trabajo', feature1: 'Email directo', feature2: 'Descripción completa', feature3: 'Soporte prioritario',
    mostPopular: 'Más Popular',
  },
  fr: {
    title: 'Débloquer les Contacts', subtitle: 'Accédez aux coordonnées exclusives',
    singleJob: '1 Contact', pack5: 'Pack 5 Contacts', pack10: 'Pack 10 Contacts', unlimited: 'Illimité 30 jours',
    cta: 'Débloquer', close: 'Fermer', secure: 'Paiement sécurisé Stripe',
    perJob: '/emploi', feature1: 'Email direct', feature2: 'Description complète', feature3: 'Support prioritaire',
    mostPopular: 'Populaire',
  },
  de: {
    title: 'Kontakt freischalten', subtitle: 'Exklusiven Zugang zu Arbeitgeberkontakten',
    singleJob: '1 Kontakt', pack5: '5er Pack', pack10: '10er Pack', unlimited: 'Unbegrenzt 30 Tage',
    cta: 'Freischalten', close: 'Schließen', secure: 'Sichere Zahlung mit Stripe',
    perJob: '/Stelle', feature1: 'Direkte E-Mail', feature2: 'Vollständige Beschreibung', feature3: 'Prioritätsunterstützung',
    mostPopular: 'Beliebt',
  },
};

const FALLBACK = LABELS['en'];

export default function PaywallModal({ isOpen, onClose, jobId, jobTitle, lang, company }: {
  isOpen: boolean; onClose: () => void; jobId: number; jobTitle: string; lang: Lang; company: string;
}) {
  const [selectedPlan, setSelectedPlan] = useState<string>('pack10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const L = LABELS[lang] || FALLBACK;

  async function handleCheckout() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, jobId, lang }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setError(data.error || 'Payment error'); setLoading(false); }
    } catch { setError('Connection error'); setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto z-10"
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors text-lg">×</button>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center text-2xl">🔒</div>
            <h2 className="text-xl font-bold text-gray-900">{L.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{company} — {jobTitle}</p>
          </div>
          <div className="space-y-2 mb-4">
            {Object.entries(PRICES).map(([key, p]) => {
              const isSelected = selectedPlan === key;
              return (
                <button key={key} onClick={() => setSelectedPlan(key)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-sky-500 bg-sky-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-sky-500' : 'border-gray-300'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-sky-500" />}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{L[p.label]}</span>
                    {p.popular && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">{L.mostPopular}</span>}
                  </div>
                  <span className="font-bold text-gray-900">${p.amount}{key !== 'unlimited' ? L.perJob : ''}</span>
                </button>
              );
            })}
          </div>
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span>{L.feature1}</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span>{L.feature2}</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span>{L.feature3}</li>
            </ul>
          </div>
          {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}
          <button onClick={handleCheckout} disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-sky-200">
            {loading ? 'Processing...' : L.cta}
          </button>
          <p className="text-center text-[11px] text-gray-400 mt-3">{L.secure}</p>
        </div>
      </div>
    </div>
  );
}