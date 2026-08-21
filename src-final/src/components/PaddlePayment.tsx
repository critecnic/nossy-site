"use client";

import React, { useState } from 'react';
import type { Lang } from '@/lib/i18n';
import { i18n } from '@/lib/i18n';

interface PaddlePaymentProps {
  jobId: number;
  jobTitle: string;
  lang: Lang;
  onSuccess?: () => void;
  compact?: boolean;
}

export default function PaddlePayment({ jobId, jobTitle, lang, onSuccess, compact = false }: PaddlePaymentProps) {
  const [step, setStep] = useState<'email' | 'code' | 'checkout'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const T = i18n[lang] || i18n['en'];

  async function handleSendCode() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(T.invalidEmail);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, jobId }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('code');
        setCodeSent(true);
      } else {
        setError(data.error || T.errorSendingCode);
      }
    } catch {
      setError(T.connectionError);
    }
    setLoading(false);
  }

  async function handleVerifyCode() {
    if (code.length !== 6) {
      setError(T.invalidCode);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, jobId }),
      });
      const data = await res.json();
      if (data.valid === true) {
        setStep('checkout');
        handleCheckout(email);
      } else if (data.valid === 'expired') {
        setError(T.codeExpired);
      } else {
        setError(T.invalidCode);
      }
    } catch {
      setError(T.connectionError);
    }
    setLoading(false);
  }

  async function handleCheckout(verifiedEmail?: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: verifiedEmail || email,
          jobId,
          jobTitle,
          lang,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || T.paymentError);
        setLoading(false);
      }
    } catch {
      setError(T.connectionError);
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {step === 'email' && (
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              onClick={handleSendCode}
              disabled={loading || !email}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 transition-all whitespace-nowrap"
            >
              {loading ? T.processing : T.sendCode}
            </button>
          </div>
        )}
        {step === 'code' && (
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={T.enterCode}
              maxLength={6}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 tracking-widest text-center"
            />
            <button
              onClick={handleVerifyCode}
              disabled={loading || code.length !== 6}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 transition-all whitespace-nowrap"
            >
              {loading ? T.processing : T.verifyEmail}
            </button>
          </div>
        )}
        {step === 'checkout' && (
          <div className="text-center text-sm text-gray-500">{T.processing}</div>
        )}
        {codeSent && step === 'code' && (
          <p className="text-xs text-green-600">{T.codeSent}</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 space-y-4">
      {step === 'email' && (
        <>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{T.unlockContact}</h3>
            <p className="text-sm text-gray-500 mt-1">{T.payToUnlock}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{T.emailLabel}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button
            onClick={handleSendCode}
            disabled={loading || !email}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-sky-200"
          >
            {loading ? T.processing : T.sendCode}
          </button>
        </>
      )}
      {step === 'code' && (
        <>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center text-2xl">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-sm text-green-600 font-medium">{T.codeSent}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{T.enterCode}</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 tracking-[0.5em] text-center text-lg font-mono"
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button
            onClick={handleVerifyCode}
            disabled={loading || code.length !== 6}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-sky-200"
          >
            {loading ? T.processing : T.verifyEmail}
          </button>
        </>
      )}
      {step === 'checkout' && (
        <div className="text-center py-6">
          <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full mx-auto mb-3" />\n          <p className="text-sm text-gray-500">{T.processing}</p>
        </div>
      )}
      <p className="text-center text-[11px] text-gray-400">{T.securePayment}</p>
    </div>
  );
}