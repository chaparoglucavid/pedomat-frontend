import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle2, KeyRound } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('E-poçt ünvanını daxil edin');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Düzgün e-poçt ünvanı daxil edin');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(email);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Xəta baş verdi');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Giriş səhifəsinə qayıt
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-cyan-500/20">
            PD
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">PadDispenser</h1>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>

        {success ? (
          /* Success state */
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">E-poçt göndərildi!</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                <span className="font-medium text-slate-700">{email}</span> ünvanına şifrə sıfırlama linki göndərildi. 
                Zəhmət olmasa e-poçtunuzu yoxlayın.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-xs text-amber-700">
                  E-poçt gəlmədisə, spam qovluğunu yoxlayın. Link 24 saat ərzində etibarlıdır.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
              >
                Giriş səhifəsinə qayıt
              </button>
            </div>
          </div>
        ) : (
          /* Form state */
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <KeyRound size={22} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Şifrəni Sıfırla</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              E-poçt ünvanınızı daxil edin, sizə şifrə sıfırlama linki göndərəcəyik.
            </p>

            {error && (
              <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  E-poçt ünvanı
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="admin@paddispenser.az"
                    autoComplete="email"
                    autoFocus
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all placeholder:text-slate-400 disabled:opacity-60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Göndərilir...
                  </>
                ) : (
                  'Sıfırlama linki göndər'
                )}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-6">
          PadDispenser Admin Panel v1.0 — 2026
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
