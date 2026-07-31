"use client";

import React, { useState, useEffect, useRef } from "react";
import { countryNames } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

/* ====================================================================
   PaywallContact — PayPal Commerce Platform (PPCP)
   ────────────────────────────────────────────────────────────────────
   • Bloqueia: e-mail, contato, dados da empresa
   • Valor: $7 USD (compra única)
   • Checkout: pop-up PayPal sobre a página (sem redirecionar)
   • Liberação instantânea via onApprove + localStorage
   • Troque NEXT_PUBLIC_PAYPAL_CLIENT_ID no .env pelo seu Client ID
   ==================================================================== */

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "SEU_CLIENT_ID_AQUI";
const PRICE = "7.00";
const CURRENCY = "USD";

interface PaywallContactProps {
  contactEmail: string;
  companyData?: {
    company: string;
    companyUrl: string;
    location: string;
    salary: string;
  };
  jobId: string;
  lang: Lang;
}

const paywallText: Record<string, { title: string; btn: string; paid: string }> = {
  "en": { title: "To unlock this company's email, contact and data, make a one-time payment of $7 dollars", btn: "Pay $7 with PayPal", paid: "Access unlocked" },
  "pt-br": { title: "Para liberar o e-mail, contato e dados desta empresa, faça o pagamento único de $7 dólares", btn: "Pagar $7 com PayPal", paid: "Acesso liberado" },
  "pt-pt": { title: "Para desbloquear o e-mail, contacto e dados desta empresa, faça o pagamento único de $7 dólares", btn: "Pagar $7 com PayPal", paid: "Acesso desbloqueado" },
  "es": { title: "Para desbloquear el correo, contacto y datos de esta empresa, realice el pago único de $7 dólares", btn: "Pagar $7 con PayPal", paid: "Acceso desbloqueado" },
  "fr": { title: "Pour débloquer l'e-mail, le contact et les données de cette entreprise, effectuez un paiement unique de 7 $", btn: "Payer 7 $ avec PayPal", paid: "Accès débloqué" },
  "zh": { title: "解锁此公司的邮箱、联系人和数据，请一次性支付7美元", btn: "使用 PayPal 支付 $7", paid: "已解锁" },
  "ja": { title: "この企業のメール、連絡先、データをアンロックするには、7ドルの一回払いをしてください", btn: "PayPalで$7支払う", paid: "アンロック済み" },
  "ar": { title: "لفتح البريد الإلكتروني ومعلومات الاتصال وبيانات هذه الشركة، قم بدفعة واحدة بقيمة 7 دولارات", btn: "ادفع 7$ عبر PayPal", paid: "تم فتح الوصول" },
  "de": { title: "Um E-Mail, Kontakt und Unternehmensdaten freizuschalten, zahlen Sie einmalig 7 $", btn: "7 $ mit PayPal zahlen", paid: "Zugang freigeschaltet" },
  "hi": { title: "इस कंपनी का ईमेल, संपर्क और डेटा अनलॉक करने के लिए $7 का एकमुश्त भुगतान करें", btn: "PayPal से $7 भुगतान करें", paid: "अनलॉक किया गया" },
};

export default function PaywallContact({ contactEmail, companyData, jobId, lang }: PaywallContactProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [paypalError, setPaypalError] = useState("");
  const [loading, setLoading] = useState(false);
  const btnContainerRef = useRef<HTMLDivElement>(null);
  const text = paywallText[lang] || paywallText["en"];

  // Check localStorage on mount
  useEffect(() => {
    const key = `ww_paid_${jobId}`;
    if (localStorage.getItem(key)) setUnlocked(true);
  }, [jobId]);

  // Load PayPal SDK dynamically
  useEffect(() => {
    if (unlocked || sdkReady) return;

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=${CURRENCY}&intent=capture`;
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => setPaypalError("PayPal SDK could not be loaded");
    document.head.appendChild(script);

    return () => { document.head.removeChild(script); };
  }, [unlocked, sdkReady]);

  // Render PayPal buttons
  useEffect(() => {
    if (!sdkReady || unlocked || !btnContainerRef.current) return;

    const container = btnContainerRef.current;
    container.innerHTML = "";

    // @ts-ignore — PayPal global
    if (typeof window.paypal === "undefined") return;

    // @ts-ignore
    window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
        height: 40,
      },
      createOrder: async () => {
        setLoading(true);
        setPaypalError("");
        try {
          // @ts-ignore
          const res = await window.paypal.request({
            method: "POST",
            url: "/api/paypal/create-order",
            body: JSON.stringify({ jobId, price: PRICE, currency: CURRENCY }),
          });
          return res.id;
        } catch {
          // Fallback client-side order (sem backend)
          // Quando o backend estiver pronto, remova este fallback
          try {
            // @ts-ignore
            const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${btoa(PAYPAL_CLIENT_ID + ":")}`,
              },
              body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [{
                  amount: { currency_code: CURRENCY, value: PRICE },
                  description: `W-W Job Access - ${jobId}`,
                }],
              }),
            });
            const data = await res.json();
            if (data.id) return data.id;
            throw new Error("No order ID");
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Payment error";
            setPaypalError(msg);
            setLoading(false);
            return "ERROR";
          }
        }
      },
      onApprove: async (data: { orderID: string }) => {
        try {
          // Try server-side capture first
          try {
            const res = await fetch("/api/paypal/capture", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID, jobId }),
            });
            const result = await res.json();
            if (result.status === "COMPLETED") {
              localStorage.setItem(`ww_paid_${jobId}`, data.orderID);
              setUnlocked(true);
              setLoading(false);
              return;
            }
          } catch { /* fallback below */ }

          // Fallback client-side capture
          const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${data.orderID}/capture`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${btoa(PAYPAL_CLIENT_ID + ":")}`,
            },
          });
          const result = await res.json();
          if (result.status === "COMPLETED") {
            localStorage.setItem(`ww_paid_${jobId}`, data.orderID);
            setUnlocked(true);
          } else {
            setPaypalError("Payment not completed");
          }
        } catch {
          setPaypalError("Error capturing payment");
        }
        setLoading(false);
      },
      onCancel: () => {
        setLoading(false);
        setPaypalError("");
      },
      onError: (err: { message?: string }) => {
        setLoading(false);
        setPaypalError(err.message || "PayPal error");
      },
    }).render(container);
  }, [sdkReady, unlocked, jobId]);

  /* ── UNLOCKED STATE ─────────────────────────────────────────────── */
  if (unlocked) {
    return (
      <div className="mt-4 border-t border-emerald-200 bg-emerald-50/50 -mx-5 -mb-5 px-5 pb-5 pt-3 rounded-b-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            ✅ {text.paid}
          </span>
        </div>
        <div className="space-y-2 text-sm">
          {companyData && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Empresa:</span>
                <a href={companyData.companyUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-sky-600 hover:text-sky-800">
                  {companyData.company} →
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Localização:</span>
                <span className="font-medium text-gray-800">{companyData.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Salário:</span>
                <span className="font-medium text-emerald-600">{companyData.salary}</span>
              </div>
            </>
          )}
          <div className="flex items-center justify-between">
            <span className="text-gray-500">E-mail de contato:</span>
            <a href={`mailto:${contactEmail}`} className="font-medium text-sky-600 hover:text-sky-800 break-all">
              {contactEmail}
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ── LOCKED STATE (PAYWALL) ─────────────────────────────────────── */
  return (
    <div className="mt-4 border-t border-amber-200 bg-amber-50/60 -mx-5 -mb-5 px-5 pb-5 pt-4 rounded-b-xl">
      {/* Warning icon + message */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-amber-100">
          <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-sm text-amber-800 leading-relaxed">{text.title}</p>
      </div>

      {/* PayPal Button Container */}
      <div ref={btnContainerRef} className="min-h-[44px]" />

      {/* Loading spinner */}
      {loading && !paypalError && (
        <div className="flex items-center justify-center gap-2 mt-2">
          <svg className="h-4 w-4 animate-spin text-sky-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-xs text-gray-500">Processing payment...</span>
        </div>
      )}

      {/* Error message */}
      {paypalError && (
        <p className="mt-2 text-xs text-red-500">{paypalError}</p>
      )}

      {/* Hidden data placeholders (visually blocked) */}
      <div className="mt-3 space-y-1.5 opacity-30">
        <div className="h-4 w-48 rounded bg-gray-300" />
        <div className="h-4 w-36 rounded bg-gray-300" />
        <div className="h-4 w-52 rounded bg-gray-300" />
      </div>
    </div>
  );
}
