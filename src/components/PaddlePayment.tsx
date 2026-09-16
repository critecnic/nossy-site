"use client";

import React, { useState, useEffect } from 'react';
import type { Lang } from '@/lib/i18n';
import { i18n } from '@/lib/i18n';

interface PaddlePaymentProps {
  jobId: number;
  jobTitle: string;
  lang: Lang;
  jobUrl?: string;
  onSuccess?: () => void;
  compact?: boolean;
}

/**
 * Payment flow (matches the NOSSY premium diagram):
 *
 *  1. User types their email -> receives an e-mail with a MAGIC LINK
 *     (+ 6-digit code fallback).
 *  2. Clicking the link (or typing the code) authenticates the user on
 *     the site (signed session cookie, 30 days).
 *  3. Authenticated user opens the Paddle checkout ($7).
 *  4. Payment approved -> Paddle webhook + server verification ->
 *     user status becomes "Premium" -> content unlocked.
 */
export default function PaddlePayment({ jobId, jobTitle, lang, jobUrl, onSuccess, compact = false }: PaddlePaymentProps) {
  const [step, setStep] = useState<'email' | 'code' | 'pay' | 'checkout'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [skipNote, setSkipNote] = useState('');
  const [fallbackCode, setFallbackCode] = useState('');

  const T = i18n[lang] || i18n['en'];
  const EN = i18n['en'];
  const t = (key: string) => T[key] || EN[key] || '';

  // On mount: already authenticated (magic link clicked before)? Skip
  // straight to the payment step with the session email pre-filled.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/session')
      .then(r => (r.ok ? r.json() : { authenticated: false }))
      .then(d => {
        if (!cancelled && d.authenticated && d.email) {
          setEmail(d.email);
          setStep('pay');
        }
      })
      .catch(() => { /* stay on email step */ });
    return () => { cancelled = true; };
  }, []);

  async function handleSendCode() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('invalidEmail'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, jobId, jobUrl }),
      });
      // Graceful degradation (Premium 0220): if the email provider is not
      // configured, skip the code step and go straight to payment — Paddle
      // collects and validates the buyer email itself. The 6-digit flow
      // comes back automatically once an email key is configured.
      if (res.status === 503) {
        setSkipNote(t('emailSkipNote'));
        setStep('pay');
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        // Email delivery not configured yet (no provider key): the server
        // returns the universal code so the step can display it on screen.
        // With a provider configured the code is e-mailed instead.
        setFallbackCode(data.emailConfigured === false && data.code ? String(data.code) : '');
        setStep('code');
        setCodeSent(true);
      } else {
        setError(data.error || t('errorSendingCode'));
      }
    } catch {
      setError(t('connectionError'));
    }
    setLoading(false);
  }

  async function handleVerifyCode() {
    if (code.length !== 6) {
      setError(t('invalidCode'));
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
        // Server issued the signed session cookie -> authenticated
        setStep('pay');
      } else if (data.valid === 'expired') {
        setError(t('codeExpired'));
      } else {
        setError(t('invalidCode'));
      }
    } catch {
      setError(t('connectionError'));
    }
    setLoading(false);
  }

  async function handleCheckout() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          jobId,
          jobTitle,
          lang,
          jobUrl,
        }),
      });
      const data = await res.json();
      if (data.url) {
        // Remember the buyer email so the job page can verify the
        // payment with the Paddle API right after the redirect.
        try { sessionStorage.setItem('nossy_checkout_email', email); } catch { /* ignore */ }
        window.location.href = data.url;
      } else {
        setError(data.error || t('paymentError'));
        setLoading(false);
      }
    } catch {
      setError(t('connectionError'));
      setLoading(false);
    }
  }

  const emailRow = (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{t('emailLabel')}</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@example.com"
        className={"w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" + (compact ? " px-3 py-2 rounded-lg" : "")}
      />
    </div>
  );

  const payButton = (
    <button
      onClick={handleCheckout}
      disabled={loading || !email}
      className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 shadow-lg shadow-amber-200"
    >
      {loading ? t('processing') : (t('payNow') || 'Pay $7 - Unlock Now')}
    </button>
  );

  const errorRow = error && <p className={"text-red-500 text-center " + (compact ? "text-xs" : "text-sm")}>{error}</p>;

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
              {loading ? t('processing') : t('sendCode')}
            </button>
          </div>
        )}
        {step === 'code' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t('enterCode')}
                maxLength={6}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 tracking-widest text-center"
              />
              <button
                onClick={handleVerifyCode}
                disabled={loading || code.length !== 6}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 transition-all whitespace-nowrap"
              >
                {loading ? t('processing') : t('verifyEmail')}
              </button>
            </div>
            {fallbackCode && (
              <div className="text-center py-2 px-3 bg-amber-50 border border-amber-100 rounded-lg">
                <p className="text-xs text-amber-700">{t('emailFallbackNote')}</p>
                <p className="text-xl font-mono font-bold tracking-[0.35em] text-amber-900 mt-1">{fallbackCode}</p>
              </div>
            )}
            {!fallbackCode && <p className="text-xs text-gray-400">{t('magicLinkNote')}</p>}
          </div>
        )}
        {step === 'pay' && (
          <>
            {skipNote && <p className="text-xs text-amber-600">{skipNote}</p>}
            {payButton}
          </>
        )}
        {step === 'checkout' && (
          <div className="text-center text-sm text-gray-500">{t('processing')}</div>
        )}
        {codeSent && step === 'code' && !fallbackCode && (
          <p className="text-xs text-green-600">{t('codeSent')}</p>
        )}
        {errorRow}
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
            <h3 className="text-lg font-bold text-gray-900">{t('unlockContact')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('payToUnlock')}</p>
          </div>
          {emailRow}
          {errorRow}
          <button
            onClick={handleSendCode}
            disabled={loading || !email}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-sky-200"
          >
            {loading ? t('processing') : t('sendCode')}
          </button>
        </>
      )}
      {step === 'code' && (
        <>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center text-2xl">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            {!fallbackCode && (
              <>
                <p className="text-sm text-green-600 font-medium">{t('codeSent')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('magicLinkNote')}</p>
              </>
            )}
            {fallbackCode && (
              <div className="py-3 px-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-700">{t('emailFallbackNote')}</p>
                <p className="text-2xl font-mono font-bold tracking-[0.4em] text-amber-900 mt-2">{fallbackCode}</p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterCode')}</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 tracking-[0.5em] text-center text-lg font-mono"
            />
          </div>
          {errorRow}
          <button
            onClick={handleVerifyCode}
            disabled={loading || code.length !== 6}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-sky-200"
          >
            {loading ? t('processing') : t('verifyEmail')}
          </button>
        </>
      )}
      {step === 'pay' && (
        <>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{t('unlockContact')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('payToUnlock')}</p>
            {skipNote && <p className="text-xs text-amber-600 mt-2">{skipNote}</p>}
            {email && (
              <p className="text-xs text-gray-400 mt-2">
                {(t('connectedAs') || 'Signed in as')} <span className="font-medium text-gray-600">{email}</span>
              </p>
            )}
          </div>
          {errorRow}
          {payButton}
        </>
      )}
      {step === 'checkout' && (
        <div className="text-center py-6">
          <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500">{t('processing')}</p>
        </div>
      )}
      <p className="text-center text-[11px] text-gray-400">{t('securePayment')}</p>
    </div>
  );
}
