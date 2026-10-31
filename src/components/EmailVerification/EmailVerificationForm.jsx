import { Fragment, useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, CornerDownLeft } from 'lucide-react';
import { unsamEmailRegex } from '../RegisterForm/validationSchema';
import { resendVerification, verifyEmail } from '../../services/authService';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;
const VERIFIED_REDIRECT_DELAY_MS = 1500;
const EMPTY_CODE = Array(CODE_LENGTH).fill('');

const NOTICE_STYLES = {
  error: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
  success: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
};

const formatCooldown = (seconds) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remaining = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remaining}`;
};

export default function EmailVerificationForm({ email, onVerified }) {
  const [digits, setDigits] = useState(EMPTY_CODE);
  const [status, setStatus] = useState('idle');
  const [notice, setNotice] = useState(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  const emailValido = unsamEmailRegex.test(email.trim());
  const verifying = status === 'verifying';
  const controlsDisabled = !emailValido || verifying || resending;
  const codeComplete = digits.every(Boolean);
  const canVerify = codeComplete && !controlsDisabled;
  const hasError = notice?.tone === 'error';

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (status !== 'idle' || digits.some(Boolean)) return;
    inputRefs.current[0]?.focus();
  }, [status, digits]);

  useEffect(() => {
    if (status !== 'verified') return undefined;
    const timer = setTimeout(() => onVerified?.(), VERIFIED_REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status, onVerified]);

  const focusBox = (index) => {
    inputRefs.current[Math.max(0, Math.min(index, CODE_LENGTH - 1))]?.focus();
  };

  const verifyCode = async () => {
    setStatus('verifying');
    setNotice(null);
    try {
      const data = await verifyEmail({ email, code: digits.join('') });
      setStatus('verified');
      setNotice({ tone: 'success', message: data.message });
    } catch (err) {
      setStatus('idle');
      if (err.status === 400) {
        setDigits(EMPTY_CODE);
      }
      setNotice({ tone: 'error', message: err.message });
    }
  };

  const setDigitAt = (index, digit) => {
    setDigits((current) => current.map((value, i) => (i === index ? digit : value)));
  };

  const fillCode = (chars) => {
    setDigits(Array.from({ length: CODE_LENGTH }, (_, i) => chars[i] ?? ''));
    focusBox(chars.length);
  };

  const handleChange = (index, event) => {
    const { value } = event.target;
    if (value === '') {
      setDigitAt(index, '');
      return;
    }

    const typed = value.replace(/\D/g, '');
    if (typed.length >= CODE_LENGTH) {
      fillCode(typed);
      return;
    }

    if (!/\d$/.test(value)) return;

    setDigitAt(index, value.slice(-1));
    focusBox(index + 1);
  };

  const handleKeyDown = (index, event) => {
    switch (event.key) {
      case 'Backspace':
        if (!digits[index] && index > 0) {
          event.preventDefault();
          setDigitAt(index - 1, '');
          focusBox(index - 1);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        focusBox(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        focusBox(index + 1);
        break;
      default:
        break;
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '');
    if (pasted) fillCode(pasted);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (canVerify) verifyCode();
  };

  const resendCode = async () => {
    setResending(true);
    setNotice(null);
    try {
      const data = await resendVerification({ email });
      setNotice({ tone: 'success', message: data.message });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setNotice({ tone: 'error', message: err.message });
    } finally {
      setResending(false);
    }
  };

  if (status === 'verified') {
    return (
      <div role="alert" className={`p-4 rounded-xl border flex items-start gap-2.5 text-sm ${NOTICE_STYLES.success}`}>
        <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
        <p className="font-medium leading-snug">{notice.message}</p>
      </div>
    );
  }

  const NoticeIcon = notice?.tone === 'success' ? CheckCircle2 : AlertCircle;
  const half = CODE_LENGTH / 2;

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full text-white font-inter space-y-4">
      <h2 className="font-outfit font-bold text-2xl leading-tight text-center">
        Ingresá el código de verificación
      </h2>

      {!emailValido && (
        <div role="alert" className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${NOTICE_STYLES.error}`}>
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <p className="flex-1 leading-snug font-medium">
            El correo no es institucional. Debe ser @unsam.edu.ar o @estudiantes.unsam.edu.ar.
          </p>
        </div>
      )}

      {notice && (
        <div role="alert" className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${NOTICE_STYLES[notice.tone]}`}>
          <NoticeIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
          <p className="flex-1 leading-snug font-medium">{notice.message}</p>
        </div>
      )}

      <div
        role="group"
        aria-label={`Código de verificación de ${CODE_LENGTH} dígitos`}
        className={`flex items-center justify-center gap-1.5 py-4 rounded-xl border bg-[#0a1220] transition-all focus-within:ring-1 ${
          hasError
            ? 'border-rose-500 focus-within:ring-rose-500'
            : 'border-slate-700/70 focus-within:border-sky-500 focus-within:ring-sky-500'
        }`}
      >
        {digits.map((digit, index) => (
          <Fragment key={index}>
            {index === half && (
              <span aria-hidden="true" className="text-slate-500 text-2xl font-semibold px-1">
                -
              </span>
            )}
            <input
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="X"
              aria-label={`Dígito ${index + 1} de ${CODE_LENGTH}`}
              aria-invalid={hasError || undefined}
              value={digit}
              onChange={(event) => handleChange(index, event)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
              disabled={controlsDisabled}
              className="w-7 sm:w-8 h-12 bg-transparent text-center text-2xl font-semibold text-white placeholder-slate-600 focus:outline-none disabled:opacity-50"
            />
          </Fragment>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-slate-400 leading-tight">
          {cooldown > 0
            ? `Podrás solicitar un nuevo código en ${formatCooldown(cooldown)}`
            : '¿No recibiste el código?'}
        </p>
        <button
          type="button"
          onClick={resendCode}
          disabled={controlsDisabled || cooldown > 0}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-[11px] font-semibold text-white transition-all cursor-pointer hover:from-sky-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CornerDownLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Reenviar código
        </button>
      </div>

      <button
        type="submit"
        disabled={!canVerify}
        className="w-full py-3 px-4 rounded-xl font-outfit font-semibold text-sm text-white bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 hover:from-cyan-300 hover:to-blue-500 active:scale-[0.99] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {verifying ? 'Verificando...' : 'Verificar cuenta'}
        {!verifying && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
      </button>
    </form>
  );
}
