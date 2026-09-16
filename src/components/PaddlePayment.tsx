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

declare global {
  interface Window {
    Paddle?: any;
  }
}

// ─── Paddle.js (overlay checkout) ──────────────────────────────────────
// Paddle Billing checkouts open as an overlay ON our own site. The API
// returns a checkout URL composed of the account's default payment link
// plus ?_ptxn=<txn id>; opening the overlay with the transaction id via
// Paddle.js is the documented way to collect payment (no page reload).
const PADDLE_ENV = (process.env.NEXT_PUBLIC_PADDLE_ENV || 'sandbox').toLowerCase();
const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '';

let paddleReady: Promise<any> | null = null;

function loadPaddle(): Promise<any> {
  if (paddleReady) return paddleReady;
  paddleReady = new Promise((resolve, reject) => {
    if (window.Paddle) return resolve(window.Paddle);
    const s = document.createElement('script');
    s.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    s.async = true;
    s.onload = () => (window.Paddle ? resolve(window.Paddle) : reject(new Error('Paddle.js loaded but window.Paddle missing')));
    s.onerror = () => reject(new Error('Failed to load Paddle.js'));
    document.head.appendChild(s);
  });
  return paddleReady;
}

function initPaddle(): Promise<any> {
  return loadPaddle().then(Paddle => {
    if (Paddle.__nossyInitialized) return Paddle;
    if (PADDLE_ENV === 'sandbox') Paddle.Environment.set('sandbox');
    Paddle.Initialize({ token: PADDLE_CLIENT_TOKEN });
    Paddle.__nossyInitialized = true;
    return Paddle;
  });
}

/**
 * Payment flow (owner decision — NO email anywhere):
 *
 *  1. User clicks premium -> the page shows RANDOM 6-digit numbers
 *     (server-generated, HMAC-signed HttpOnly cookie).
 *  2. User types the numbers manually -> verified server-side.
 *  3. Verified user opens the Paddle checkout ($7) — Paddle collects the
 *     buyer email on the overlay itself (guest checkout) for the receipt.
 *  4. Payment approved -> Paddle webhook + server verification ->
 *     user status becomes "Premium" -> content unlocked.
 */
export default function PaddlePayment({ jobId, jobTitle, lang, jobUrl, onSuccess, compact = false }: PaddlePaymentProps) {
  const [step, setStep] = useState<'code' | 'pay' | 'checkout'>('code');
  const [challenge, setChallenge] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const T = i18n[lang] || i18n['en'];
  const EN = i18n['en'];
  const t = (key: string) => T[key] || EN[key] || '';

  // On mount: fetch a random on-screen challenge (numbers to type back).
  async function loadChallenge() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (data.success && data.code) {
        setChallenge(String(data.code));
        setCode('');
      } else {
        setError(data.error || t('errorSendingCode'));
      }
    } catch {
      setError(t('connectionError'));
    }
    setLoading(false);
  }

  useEffect(() => { loadChallenge(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, []);

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
        body: JSON.stringify({ code, jobId }),
      });
      const data = await res.json();
      if (data.valid === true) {
        // Numbers confirmed -> payment step
        setStep('pay');
      } else if (data.valid === 'expired') {
        setError(t('codeExpired'));
        // Challenge expired -> generate new numbers automatically
        loadChallenge();
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
          jobId,
          jobTitle,
          lang,
          jobUrl,
        }),
      });
      const data = await res.json();
      if (data.url) {
        const successUrl = (jobUrl || ('/' + lang + '/jobs')) + ((jobUrl || '').includes('?') ? '&' : '?') + 'payment=success';

        // Preferred: overlay checkout via Paddle.js (documented flow for
        // server-side created transactions). Fallback: navigate to the
        // checkout URL returned by the API.
        if (data.transactionId && PADDLE_CLIENT_TOKEN) {
          try {
            const Paddle = await initPaddle();
            Paddle.on('checkout.completed', () => {
              window.location.href = successUrl;
            });
            await Paddle.Checkout.open({ transactionId: data.transactionId });
            setStep('checkout');
            return; // overlay handles the rest — keep spinner
          } catch (e) {
            // fall through to redirect fallback
          }
        }
        window.location.href = data.url;
        return;
      } else {
        setError(data.error || t('paymentError'));
        setLoading(false);
      }
    } catch {
      setError(t('connectionError'));
      setLoading(false);
    }
  }

  const payButton = (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 shadow-lg shadow-amber-200"
    >
      {loading ? t('processing') : (t('payNow') || 'Pay $7 - Unlock Now')}
    </button>
  );

  const errorRow = error && <p className={"text-red-500 text-center " + (compact ? "text-xs" : "text-sm")}>{error}</p>;

  const challengeBox = (
    <div className={"bg-amber-50 border border-amber-100 rounded-xl text-center " + (compact ? "py-2 px-3" : "py-4 px-4")}>
      <p className={"text-amber-700 " + (compact ? "text-[11px]" : "text-xs")}>{t('codePrompt')}</p>
      <p className={"font-mono font-bold tracking-[0.35em] text-amber-900 select-all " + (compact ? "text-xl mt-1" : "text-3xl mt-2")}>
        {challenge || '······'}
      </p>
    </div>
  );

  const verifyButton = (
    <button
      onClick={handleVerifyCode}
      disabled={loading || code.length !== 6}
      className={"bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-sky-200 " + (compact ? "px-4 py-2 text-sm rounded-lg whitespace-nowrap" : "w-full py-3")}
    >
      {loading ? t('processing') : t('verifyNumbers')}
    </button>
  );

  const newNumbersButton = (
    <button
      onClick={loadChallenge}
      disabled={loading}
      className={"text-gray-400 hover:text-sky-600 underline transition-colors disabled:opacity-50 " + (compact ? "text-[11px]" : "text-xs")}
    >
      {t('newNumbers')}
    </button>
  );

  if (compact) {
    return (
      <div className="space-y-2">
        {step === 'code' && (
          <div className="space-y-2">
            {challengeBox}
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t('enterCode')}
                inputMode="numeric"
                maxLength={6}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 tracking-widest text-center"
              />
              {verifyButton}
            </div>
            {newNumbersButton && <div className="text-center">{newNumbersButton}</div>}
          </div>
        )}
        {step === 'pay' && payButton}
        {step === 'checkout' && (
          <div className="text-center text-sm text-gray-500">{t('processing')}</div>
        )}
        {errorRow}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 space-y-4">
      {step === 'code' && (
        <>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{t('unlockContact')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('payToUnlock')}</p>
          </div>
          {challengeBox}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterCode')}</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              inputMode="numeric"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 tracking-[0.5em] text-center text-lg font-mono"
            />
          </div>
          {errorRow}
          {verifyButton}
          <div className="text-center">{newNumbersButton}</div>
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
