import { useEffect, useState, FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, Scale, Sparkles, UserCheck } from 'lucide-react';
import { apiFetch } from '../lib/api';
import type { User } from '../types';

interface AuthPagesProps {
  mode: 'login' | 'register';
  onSuccess: (user: User) => void;
  onNavigate: (path: string) => void;
}

const SAVED_EMAIL_KEY = 'add_up_saved_email';

export function AuthPages({ mode, onSuccess, onNavigate }: AuthPagesProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [name, setName] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [chamberAddress, setChamberAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'login') {
      try {
        const saved = window.localStorage.getItem(SAVED_EMAIL_KEY);
        if (saved) {
          setEmail(saved);
          setRememberEmail(true);
        }
      } catch {
        // ignore storage errors
      }
    }
  }, [mode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        mode === 'login'
          ? { email, password }
          : { email, password, name, enrollmentNo, chamberAddress, phone };

      const res = await apiFetch<{ user: User }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (mode === 'login') {
        try {
          if (rememberEmail && email.trim()) {
            window.localStorage.setItem(SAVED_EMAIL_KEY, email.trim());
          } else {
            window.localStorage.removeItem(SAVED_EMAIL_KEY);
          }
        } catch {
          // ignore storage errors
        }
      }

      onSuccess(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillSample = () => {
    setError('');
    setEmail('advocate.sharma@example.in');
    setPassword('LucknowChambers#2026');
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'advocate.sharma@example.in',
          password: 'LucknowChambers#2026',
        }),
      });
      onSuccess(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in with sample account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#0F2342] mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Home · मुख्य पृष्ठ</span>
        </button>

        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-[#0F2342] text-white flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5 text-[#D4AF37]" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F2342]">
                {mode === 'login' ? 'Chambers Sign In · लॉगिन' : 'Create Chambers Account'}
              </h1>
              <p className="text-xs text-slate-500">Advocate Digital Desk – Uttar Pradesh</p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <form method="post" autoComplete="on" onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="auth-name" className="block text-sm font-semibold text-slate-800 mb-1">
                    Advocate Full Name · अधिवक्ता का पूरा नाम *
                  </label>
                  <input
                    id="auth-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Adv. Rakesh Kumar Mishra"
                    className="w-full min-h-[44px] px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0F2342]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="auth-enroll" className="block text-xs font-semibold text-slate-700 mb-1">
                      Bar Enrollment No. (Optional)
                    </label>
                    <input
                      id="auth-enroll"
                      name="enrollmentNo"
                      type="text"
                      value={enrollmentNo}
                      onChange={(e) => setEnrollmentNo(e.target.value)}
                      placeholder="UP/0000/2010"
                      className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0F2342]"
                    />
                  </div>
                  <div>
                    <label htmlFor="auth-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                      Chamber Phone (Optional)
                    </label>
                    <input
                      id="auth-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91-98..."
                      className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0F2342]"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="auth-chamber" className="block text-xs font-semibold text-slate-700 mb-1">
                    Chamber Address (Optional)
                  </label>
                  <input
                    id="auth-chamber"
                    name="chamberAddress"
                    type="text"
                    autoComplete="street-address"
                    value={chamberAddress}
                    onChange={(e) => setChamberAddress(e.target.value)}
                    placeholder="High Court Lucknow Bench / Kaiserbagh Civil Court"
                    className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0F2342]"
                  />
                </div>
              </>
            )}

            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label htmlFor="auth-email" className="block text-sm font-semibold text-slate-800">
                  Email Address · ईमेल पता *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={handleAutofillSample}
                    className="text-xs font-semibold text-[#9A6F1F] hover:text-[#0F2342] underline underline-offset-2 cursor-pointer"
                  >
                    Auto-fill Sample Login
                  </button>
                )}
              </div>
              <input
                id="auth-email"
                name="email"
                type="email"
                required
                autoComplete={mode === 'login' ? 'username' : 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="advocate@example.in"
                className="w-full min-h-[44px] px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0F2342]"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-sm font-semibold text-slate-800 mb-1">
                Password · पासवर्ड *
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={mode === 'register' ? 8 : 1}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Minimum 8 characters' : 'Enter your password'}
                  className="w-full min-h-[44px] px-3.5 py-2 pr-11 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0F2342]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 accent-[#0F2342]"
                />
                <span>Remember my email address on this computer (browser autofill friendly)</span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[46px] px-4 py-2.5 bg-[#0F2342] hover:bg-[#162D54] disabled:opacity-60 text-white font-semibold text-sm rounded-lg inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4" aria-hidden="true" />
              <span>
                {loading
                  ? 'Please wait...'
                  : mode === 'login'
                    ? 'Sign In to My Desk · लॉगिन करें'
                    : 'Create Account · खाता बनाएँ'}
              </span>
            </button>
          </form>

          {mode === 'login' && (
            <div className="mt-5 pt-5 border-t border-slate-200 space-y-2.5">
              <p className="text-xs text-slate-600">
                Sample Fictional Chambers Account (<span className="font-mono">advocate.sharma@example.in</span>):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleAutofillSample}
                  className="min-h-[44px] px-3 py-2 border border-slate-300 hover:border-[#0F2342] bg-white text-[#0F2342] font-semibold text-xs rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#9A6F1F] shrink-0" aria-hidden="true" />
                  <span>Auto-fill Form · फॉर्म भरें</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleDemoLogin}
                  className="min-h-[44px] px-3 py-2 bg-slate-100 hover:bg-slate-200 text-[#0F2342] font-semibold text-xs rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-[#9A6F1F] shrink-0" aria-hidden="true" />
                  <span>One-Click Demo Sign In</span>
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-slate-600">
            {mode === 'login' ? (
              <>
                New to Advocate Digital Desk?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  className="font-semibold text-[#0F2342] underline underline-offset-2 cursor-pointer"
                >
                  Create Account
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="font-semibold text-[#0F2342] underline underline-offset-2 cursor-pointer"
                >
                  Sign In Here
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
