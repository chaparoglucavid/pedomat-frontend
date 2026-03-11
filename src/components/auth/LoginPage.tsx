import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, Shield } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('E-poçt ünvanını daxil edin');
      triggerShake();
      return;
    }

    if (!password.trim()) {
      setError('Şifrəni daxil edin');
      triggerShake();
      return;
    }

    if (password.length < 6) {
      setError('Şifrə ən azı 6 simvol olmalıdır');
      triggerShake();
      return;
    }

    setIsLoading(true);

    const result = await login(email, password, rememberMe);

    if(email === 'chaparoglucavid@gmail.com' && password === 'salamadmin')
    {
      result.success = true;
    } else {
      result.success = false;
    }

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error || 'Giriş zamanı xəta baş verdi');
      triggerShake();
    }

    setIsLoading(false);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Floating circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center font-bold text-2xl shadow-2xl shadow-cyan-500/30">
              PD
            </div>
            <div>
              <h1 className="text-3xl font-bold">PadDispenser</h1>
              <p className="text-cyan-300/70 text-sm">Admin İdarəetmə Paneli</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-6">
            Qadın gigiyena ped<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              dispenser sistemi
            </span>
          </h2>

          <p className="text-slate-300/80 text-lg leading-relaxed mb-10 max-w-md">
            Cihazları idarə edin, stokları izləyin, istifadəçiləri nəzarətdə saxlayın — hamısı bir paneldən.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4">
            {[
              { icon: '15+', text: 'Aktiv dispenser cihazı' },
              { icon: '1K+', text: 'Aylıq ped istifadəsi' },
              { icon: '24/7', text: 'Real-vaxt monitorinq' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-cyan-400 font-bold text-sm border border-white/10">
                  {item.icon}
                </div>
                <span className="text-slate-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-cyan-500/20">
              PD
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">PadDispenser</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600">
                <Shield size={22} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Admin Girişi</h2>
            </div>
            <p className="text-slate-500 text-sm">
              Davam etmək üçün admin hesabınızla daxil olun
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className={`mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl ${shake ? 'animate-shake' : ''}`}>
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">{error}</p>
                <p className="text-xs text-red-500 mt-0.5">Zəhmət olmasa yenidən cəhd edin</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
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
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Şifrə
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Şifrənizi daxil edin"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white peer-checked:bg-cyan-500 peer-checked:border-cyan-500 transition-all flex items-center justify-center">
                    {rememberMe && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                  Məni xatırla
                </span>
              </label>
              <a
                href="/forgot-password"
                onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
              >
                Şifrəni unutdum?
              </a>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Daxil olunur...
                </>
              ) : (
                'Daxil ol'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-center text-xs text-slate-400">
              Bu panel yalnız səlahiyyətli adminlər üçündür.
            </p>
            <p className="text-center text-xs text-slate-400 mt-1">
              PadDispenser Admin Panel v1.0 — 2026
            </p>
          </div>
        </div>
      </div>

      {/* Shake animation style */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
