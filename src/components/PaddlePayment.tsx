"use client";

import React, { useState, useEffect } from 'react';
import type { Lang } from '@/lib/i18n';
import { i18n } from '@/lib/i18n';
import { addPaddleHandler, paddleEventCallback } from '@/lib/paddle-events';

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
    // Paddle.js v2: events ONLY via eventCallback (no Paddle.on).
    Paddle.Initialize({ token: PADDLE_CLIENT_TOKEN, eventCallback: paddleEventCallback });
    Paddle.__nossyInitialized = true;
    return Paddle;
  });
}

/**
 * Server-side confirmation of the REAL payment: the transaction id saved
 * before the overlay opened is checked against the Paddle Billing API
 * (status completed + same job). Only a REAL payment unlocks — the server
 * issues the signed cookies. No email needed (guest checkout).
 */
async function verifyPaymentSilently(jobId: number, attempt = 0): Promise<boolean> {
  try {
    const saved = JSON.parse(sessionStorage.getItem('nossy_last_txn') || 'null');
    if (!saved || !saved.txn || Number(saved.jobId) !== Number(jobId)) return false;
    const res = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txn: saved.txn, jobId: Number(jobId) }),
    });
    const d = await res.json().catch(() => ({ unlocked: false }));
    if (d.unlocked) {
      try { sessionStorage.removeItem('nossy_last_txn'); } catch { /* ignore */ }
      return true;
    }
    if (attempt < 2) {
      await new Promise(r => setTimeout(r, 2500));
      return verifyPaymentSilently(jobId, attempt + 1);
    }
    return false;
  } catch {
    if (attempt < 2) {
      await new Promise(r => setTimeout(r, 2500));
      return verifyPaymentSilently(jobId, attempt + 1);
    }
    return false;
  }
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
  const [step, setStep] = useState<'code' | 'pay' | 'checkout' | 'confirming'>('code');
  const [challenge, setChallenge] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const T = i18n[lang] || i18n['en'];
  const EN = i18n['en'];
  const t = (key: string) => T[key] || EN[key] || '';

  // On mount: fetch a random on-screen challenge (numbers to type back).
  // Se falhar (ex.: limite por minuto), tenta de novo sozinho — o usuário
  // nunca pode ficar preso sem números (bug reportado pelo dono).
  async function loadChallenge(attempt = 0) {
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
        setLoading(false);
        return;
      }
      setError(data.error || t('errorSendingCode'));
    } catch {
      setError(t('connectionError'));
    }
    setLoading(false);
    if (attempt < 2) {
      setTimeout(() => { loadChallenge(attempt + 1); }, 5000 * (attempt + 1));
    }
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
        const basePage = jobUrl || ('/' + lang + '/jobs');
        const join = basePage.includes('?') ? '&' : '?';
        const successUrl = basePage + join + 'payment=success';

        // Persist the transaction id NOW: after the overlay closes we verify
        // the REAL payment server-side (Paddle API lookup by txn + jobId) and
        // only then release the contacts. Works for guest checkout (no email).
        if (data.transactionId) {
          try {
            sessionStorage.setItem('nossy_last_txn', JSON.stringify({ txn: data.transactionId, jobId: Number(jobId), at: Date.now() }));
          } catch { /* storage unavailable */ }
        }

        // Preferred: overlay checkout via Paddle.js (documented flow for
        // server-side created transactions). The card window opens ON THIS
        // page — no redirect at all.
        if (data.transactionId && PADDLE_CLIENT_TOKEN) {
          try {
            const Paddle = await initPaddle();
            // ─── Padrão 1874 (fluxo rápido de pagamento premium) ───
            // Paddle.js v2 has no Paddle.on() — subscribe via the shared
            // event registry (fed by the Initialize eventCallback).
            // NOTE: settings (displaySuccess etc.) are NOT accepted when
            // opening by transactionId (checkout-service returns 400) —
            // so we auto-close the receipt ourselves right after approval.
            let paid = false;
            const offCompleted = addPaddleHandler(event => {
              if (event?.name !== 'checkout.completed') return;
              offCompleted();
              paid = true;
              setStep('confirming'); // card approved -> instantly confirming
              // Close the Paddle receipt automatically (fast flow: no
              // "we emailed you" screen) -> checkout.closed fires -> unlock.
              setTimeout(() => {
                try { window.Paddle?.Checkout?.close(); } catch { /* buyer can close manually */ }
              }, 1500);
            });
            const offClosed = addPaddleHandler(event => {
              if (event?.name !== 'checkout.closed') return;
              offClosed();
              if (paid) {
                setStep('confirming');
                // Server confirms the REAL payment with the Paddle API and
                // unlocks in place (Padrão 1874: fast, no email step).
                verifyPaymentSilently(jobId).then(ok => {
                  if (ok) {
                    onSuccess?.(); // page reveals the data immediately
                  } else {
                    // Confirmation lagged -> page-level loop with more retries
                    window.location.href = successUrl;
                  }
                });
              } else {
                setStep('pay'); // buyer closed before paying
                setLoading(false);
              }
            });
            await Paddle.Checkout.open({ transactionId: data.transactionId });
            setStep('checkout');
            return; // overlay handles the rest
          } catch (e) {
            // Overlay failed: land on the SAME page with ?_ptxn — the
            // global PaddleAutoOpen script re-opens the checkout there.
            window.location.href = basePage + join + '_ptxn=' + data.transactionId;
            return;
          }
        }

        // No client-side token configured: NEVER redirect to the default
        // payment link (that lands on the homepage doing nothing — the bug
        // reported by the owner). Show a clear message instead.
        setError(t('paymentSetupNote') || t('paymentError'));
        setLoading(false);
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
      onClick={() => loadChallenge(0)}
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
        {step === 'confirming' && (
          <div className="text-center text-sm font-medium text-emerald-600 flex items-center justify-center gap-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full" />
            {t('paymentConfirmed')}
          </div>
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
      {step === 'confirming' && (
        <div className="text-center py-6">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-medium text-emerald-600">{t('paymentConfirmed')}</p>
        </div>
      )}
      <p className="text-center text-[11px] text-gray-400">{t('securePayment')}</p>
    </div>
  );
}
