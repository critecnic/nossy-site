"use client";

import { useEffect } from 'react';

// ─── Paddle.js global auto-open ────────────────────────────────────────
// Mounted once in the ROOT layout. Two jobs:
//
// 1. Keeps Paddle.js ready site-wide (initialized with the client-side
//    token, sandbox aware).
// 2. When the URL contains ?_ptxn=<transaction id> (Paddle's default
//    payment link pattern), opens the checkout OVERLAY right there —
//    no redirect to the homepage, no page reload.
//
// This is the safety net for the fallback path of PaddlePayment: instead
// of landing on the default payment link (homepage) doing nothing, the
// buyer lands on the same page and the card window opens on top.

const PADDLE_ENV = (process.env.NEXT_PUBLIC_PADDLE_ENV || 'sandbox').toLowerCase();
const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '';

declare global {
  interface Window {
    Paddle?: any;
  }
}

let autoInitPromise: Promise<any> | null = null;

function initPaddleGlobal(): Promise<any> {
  if (autoInitPromise) return autoInitPromise;
  autoInitPromise = new Promise((resolve, reject) => {
    if (!PADDLE_CLIENT_TOKEN) {
      reject(new Error('Paddle client token not configured'));
      return;
    }
    if (window.Paddle?.__nossyInitialized) {
      resolve(window.Paddle);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    s.async = true;
    s.onload = () => {
      const Paddle = window.Paddle;
      if (!Paddle) {
        reject(new Error('Paddle.js loaded but window.Paddle missing'));
        return;
      }
      if (!Paddle.__nossyInitialized) {
        if (PADDLE_ENV === 'sandbox') Paddle.Environment.set('sandbox');
        Paddle.Initialize({ token: PADDLE_CLIENT_TOKEN });
        Paddle.__nossyInitialized = true;
      }
      resolve(Paddle);
    };
    s.onerror = () => reject(new Error('Failed to load Paddle.js'));
    document.head.appendChild(s);
  });
  return autoInitPromise;
}

export default function PaddleAutoOpen() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const txn = params.get('_ptxn');
      if (!txn) return;
      initPaddleGlobal()
        .then(Paddle => {
          Paddle.Checkout.open({ transactionId: txn });
          // Clean the URL so refresh/reload does not re-open the checkout.
          window.history.replaceState({}, '', window.location.pathname);
        })
        .catch(() => {
          // Without a client-side token the overlay cannot open; the buyer
          // simply stays on the current page (no broken redirect).
        });
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
