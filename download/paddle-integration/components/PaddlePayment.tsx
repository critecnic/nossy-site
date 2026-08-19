'use client';

// ============================================================
// components/PaddlePayment.tsx
// Componente reutilizavel: Email → Codigo 6 digitos → Pagar $7
// Pode ser colocado em qualquer pagina do nossy.pro
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';

// --- Props ---
interface PaddlePaymentProps {
  /** ID da vaga que sera desbloqueada apos o pagamento */
  jobId: string;
  /** Chamado quando o usuario fecha o componente */
  onClose?: () => void;
  /** Chamado apos o pagamento ser confirmado (opcional) */
  onSuccess?: () => void;
}

// --- Steps ---
type Step = 1 | 2 | 3;

// ============================================================
// Sub-componente: Icones de bandeiras de cartao / pagamentos
// ============================================================
function PaymentIcons() {
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', marginTop: '16px', marginBottom: '8px' }}>
      {/* Visa */}
      <svg width="40" height="26" viewBox="0 0 40 26" fill="none">
        <rect width="40" height="26" rx="4" fill="#1A1F71"/>
        <text x="20" y="17" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="Arial">VISA</text>
      </svg>

      {/* Mastercard */}
      <svg width="40" height="26" viewBox="0 0 40 26" fill="none">
        <rect width="40" height="26" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1"/>
        <circle cx="16" cy="13" r="8" fill="#EB001B" opacity="0.9"/>
        <circle cx="24" cy="13" r="8" fill="#F79E1B" opacity="0.9"/>
      </svg>

      {/* American Express */}
      <svg width="40" height="26" viewBox="0 0 40 26" fill="none">
        <rect width="40" height="26" rx="4" fill="#006FCF"/>
        <text x="20" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="Arial">AMEX</text>
      </svg>

      {/* Apple Pay */}
      <svg width="40" height="26" viewBox="0 0 40 26" fill="none">
        <rect width="40" height="26" rx="4" fill="#000000"/>
        <text x="6" y="17" fill="#FFFFFF" fontSize="10" fontFamily="Arial">&#63743;</text>
        <text x="19" y="17" fill="#FFFFFF" fontSize="8" fontWeight="600" fontFamily="Arial">Pay</text>
      </svg>

      {/* Google Pay */}
      <svg width="40" height="26" viewBox="0 0 40 26" fill="none">
        <rect width="40" height="26" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1"/>
        <circle cx="14" cy="13" r="3" fill="#4285F4"/>
        <circle cx="20" cy="13" r="3" fill="#EA4335"/>
        <circle cx="26" cy="13" r="3" fill="#34A853"/>
        <text x="14" y="14.5" textAnchor="middle" fill="#FFFFFF" fontSize="4" fontWeight="bold" fontFamily="Arial">G</text>
        <text x="26" y="14.5" textAnchor="middle" fill="#FFFFFF" fontSize="4" fontWeight="bold" fontFamily="Arial">P</text>
      </svg>

      {/* Pix (Brasil) */}
      <svg width="40" height="26" viewBox="0 0 40 26" fill="none">
        <rect width="40" height="26" rx="4" fill="#32BCAD"/>
        <text x="20" y="17" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="Arial">Pix</text>
      </svg>
    </div>
  );
}

// ============================================================
// Componente principal
// ============================================================
export default function PaddlePayment({ jobId, onClose, onSuccess }: PaddlePaymentProps) {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- Countdown para reenvio ---
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // --- Foco automatico no primeiro input de codigo ---
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // --- Limpa erro apos 5 segundos ---
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  // ============================================================
  // STEP 1: Enviar codigo por email
  // ============================================================
  const handleSendCode = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao enviar codigo.');
        return;
      }

      setMaskedEmail(data.maskedEmail);
      setStep(2);
      setCountdown(60);
    } catch {
      setError('Erro de conexao. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STEP 2: Verificar codigo de 6 digitos
  // ============================================================
  const handleCodeInput = useCallback(
    (index: number, value: string) => {
      // So aceita numeros
      const digit = value.replace(/\D/g, '');
      if (!digit) {
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
        return;
      }

      const newCode = [...code];
      newCode[index] = digit[0];
      setCode(newCode);

      // Avanca para o proximo campo
      if (index < 5) {
        codeRefs.current[index + 1]?.focus();
      }
    },
    [code]
  );

  const handleCodeKeyDown = useCallback(
    (index: number, key: string) => {
      if (key === 'Backspace' && !code[index] && index > 0) {
        codeRefs.current[index - 1]?.focus();
      }
    },
    [code]
  );

  const handleCodePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 0) return;

    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);

    // Foca no proximo campo vazio ou no ultimo
    const nextIndex = Math.min(pasted.length, 5);
    codeRefs.current[nextIndex]?.focus();
  }, [code]);

  const handleVerifyCode = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Digite todos os 6 digitos.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Codigo invalido.');
        return;
      }

      // Email verificado! Vai para a tela de pagamento
      setStep(3);
    } catch {
      setError('Erro de conexao. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STEP 3: Criar checkout e redirecionar
  // ============================================================
  const handlePay = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, jobId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao criar pagamento.');
        return;
      }

      // Redireciona para o checkout hospedado do Paddle
      window.location.href = data.checkoutUrl;
    } catch {
      setError('Erro de conexao. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // --- Estilos reutilizaveis ---
  const styles = {
    container: {
      width: '100%',
      maxWidth: '420px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    } as React.CSSProperties,
    card: {
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      padding: '32px',
      position: 'relative' as const,
    } as React.CSSProperties,
    stepIndicator: {
      fontSize: '13px',
      color: '#64748b',
      marginBottom: '20px',
    } as React.CSSProperties,
    title: {
      fontSize: '20px',
      fontWeight: 600 as const,
      color: '#0f172a',
      margin: '0 0 4px',
    } as React.CSSProperties,
    subtitle: {
      fontSize: '14px',
      color: '#64748b',
      margin: '0 0 24px',
    } as React.CSSProperties,
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: '1px solid #d1d5db',
      fontSize: '15px',
      outline: 'none',
      boxSizing: 'border-box' as const,
      transition: 'border-color 0.2s',
    } as React.CSSProperties,
    button: {
      width: '100%',
      padding: '14px',
      borderRadius: '10px',
      border: 'none',
      fontSize: '15px',
      fontWeight: 600 as const,
      cursor: 'pointer',
      transition: 'opacity 0.2s',
      marginTop: '20px',
    } as React.CSSProperties,
    buttonPrimary: {
      background: '#0f172a',
      color: '#ffffff',
    } as React.CSSProperties,
    buttonSecondary: {
      background: 'transparent',
      color: '#3b82f6',
      border: '1px solid #e2e8f0',
      marginTop: '12px',
    } as React.CSSProperties,
    error: {
      background: '#fef2f2',
      color: '#dc2626',
      padding: '10px 14px',
      borderRadius: '8px',
      fontSize: '13px',
      marginBottom: '16px',
      border: '1px solid #fecaca',
    } as React.CSSProperties,
    closeButton: {
      position: 'absolute' as const,
      top: '16px',
      right: '16px',
      background: 'none',
      border: 'none',
      fontSize: '20px',
      color: '#94a3b8',
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: '6px',
    } as React.CSSProperties,
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Botao fechar */}
        {onClose && (
          <button style={styles.closeButton} onClick={onClose} aria-label="Fechar">
            &#x2715;
          </button>
        )}

        {/* Indicador de step */}
        <p style={styles.stepIndicator}>
          Passo {step} de 3
        </p>

        {/* ========== STEP 1: EMAIL ========== */}
        {step === 1 && (
          <>
            <h2 style={styles.title}>Desbloquear Contato</h2>
            <p style={styles.subtitle}>
              Digite seu email para receber um codigo de verificacao
            </p>

            {error && <div style={styles.error}>{error}</div>}

            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && email.includes('@')) handleSendCode();
              }}
              style={styles.input}
              disabled={loading}
              autoFocus
            />

            <button
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                opacity: loading || !email.includes('@') ? 0.5 : 1,
              }}
              onClick={handleSendCode}
              disabled={loading || !email.includes('@')}
            >
              {loading ? 'Enviando...' : 'Enviar Codigo de Acesso'}
            </button>
          </>
        )}

        {/* ========== STEP 2: CODIGO 6 DIGITOS ========== */}
        {step === 2 && (
          <>
            <h2 style={styles.title}>Verifique seu Email</h2>
            <p style={styles.subtitle}>
              Enviamos um codigo para <strong>{maskedEmail}</strong>
            </p>

            {error && <div style={styles.error}>{error}</div>}

            {/* 6 inputs de digito */}
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              marginBottom: '20px',
            }}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { codeRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeInput(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e.key)}
                  onPaste={handleCodePaste}
                  style={{
                    width: '48px',
                    height: '56px',
                    textAlign: 'center',
                    fontSize: '22px',
                    fontWeight: 600,
                    borderRadius: '10px',
                    border: `1px solid ${error ? '#fca5a5' : '#d1d5db'}`,
                    outline: 'none',
                    background: error ? '#fff5f5' : '#ffffff',
                  }}
                  disabled={loading}
                  aria-label={`Digito ${i + 1}`}
                />
              ))}
            </div>

            <button
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                opacity: loading ? 0.5 : 1,
              }}
              onClick={handleVerifyCode}
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Verificar'}
            </button>

            {/* Reenviar codigo */}
            <button
              style={{
                ...styles.button,
                ...styles.buttonSecondary,
                opacity: countdown > 0 ? 0.5 : 1,
              }}
              onClick={() => {
                if (countdown <= 0) {
                  handleSendCode();
                }
              }}
              disabled={countdown > 0}
            >
              {countdown > 0
                ? `Reenviar em ${countdown}s`
                : 'Reenviar Codigo'}
            </button>

            {/* Voltar */}
            <button
              style={{
                ...styles.button,
                ...styles.buttonSecondary,
                marginTop: '8px',
                color: '#64748b',
                fontSize: '13px',
              }}
              onClick={() => {
                setStep(1);
                setCode(['', '', '', '', '', '']);
                setError('');
              }}
            >
              Alterar email
            </button>
          </>
        )}

        {/* ========== STEP 3: PAGAMENTO ========== */}
        {step === 3 && (
          <>
            <h2 style={styles.title}>Desbloquear Contato</h2>
            <p style={styles.subtitle}>
              Acesso aos dados de contato da vaga selecionada
            </p>

            {error && <div style={styles.error}>{error}</div>}

            {/* Preco */}
            <div style={{
              textAlign: 'center',
              padding: '20px 0 8px',
            }}>
              <span style={{
                fontSize: '40px',
                fontWeight: 700,
                color: '#0f172a',
              }}>
                $7<span style={{ fontSize: '20px', fontWeight: 400 }}>.00</span>
              </span>
              <span style={{
                fontSize: '16px',
                color: '#64748b',
                marginLeft: '6px',
              }}>
                USD
              </span>
            </div>

            {/* Icones de pagamento */}
            <PaymentIcons />

            {/* Botao pagar */}
            <button
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                opacity: loading ? 0.5 : 1,
                marginTop: '24px',
              }}
              onClick={handlePay}
              disabled={loading}
            >
              {loading ? 'Criando pagamento...' : 'Pagar Agora'}
            </button>

            {/* Seguranca */}
            <p style={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#94a3b8',
              marginTop: '16px',
              marginBottom: 0,
            }}>
              Pagamento seguro processado pelo Paddle
            </p>

            {/* Voltar */}
            <button
              style={{
                ...styles.button,
                ...styles.buttonSecondary,
                color: '#64748b',
                fontSize: '13px',
              }}
              onClick={() => {
                setStep(2);
                setError('');
              }}
            >
              Voltar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
