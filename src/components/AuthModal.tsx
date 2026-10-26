import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, AlertCircle, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { GoogleAuthButton } from './GoogleAuthButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const identifier = email || username;
        if (!identifier || !password) {
          setError('Email/Username and password are required.');
          setIsLoading(false);
          return;
        }
        await login(identifier, password);
        setSuccessMsg('Login successful!');
        setTimeout(() => onClose(), 600);
      } else {
        if (!username || !email || !password) {
          setError('All fields are required.');
          setIsLoading(false);
          return;
        }
        if (password.length < 8) {
          setError('Password must be at least 8 characters long.');
          setIsLoading(false);
          return;
        }
        await register(username, email, password);
        setSuccessMsg('Account created successfully!');
        setTimeout(() => onClose(), 600);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden my-auto">
        {/* Glow decoration */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-600/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-pink-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white mb-2 shadow-lg shadow-purple-600/30">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'OdooParty Seensa' : 'Akkaawuntii Uumi'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Kutaa sagalee dhugaa fi sirna OdooParty keessa seeni'
              : 'Akkaawuntii haarawa uumuun kutaa sagalee kee banadhu'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Email / Username
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Galmaa'i (Register)
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="flex items-start gap-2 bg-red-950/60 border border-red-500/40 p-2.5 rounded-xl text-red-200 text-xs mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 p-2.5 rounded-xl text-emerald-200 text-xs mb-4">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. user_name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              {mode === 'login' ? 'Email ykn Username' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={mode === 'register' ? 'email' : 'text'}
                required
                placeholder={mode === 'login' ? 'email@gmail.com' : 'user@example.com'}
                value={mode === 'register' ? email : (email || username)}
                onChange={(e) => {
                  if (mode === 'register') {
                    setEmail(e.target.value);
                  } else {
                    setEmail(e.target.value);
                    setUsername(e.target.value);
                  }
                }}
                className="w-full bg-slate-800/80 border border-slate-700 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Jecha Icceetii (Password)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="Yoo xiqqaate arfiilee 8"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-transform active:scale-95"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Seeni (Sign In)' : 'Akkaawuntii Uumi'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Google Sign-In with Real Identity Token Verification */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-center gap-2 mb-2.5">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Seensa Google OAuth 2.0</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>
          <GoogleAuthButton
            onSuccess={() => {
              setSuccessMsg('Signed in with Google!');
              setTimeout(() => onClose(), 600);
            }}
            onError={(err) => setError(err)}
          />
        </div>
      </div>
    </div>
  );
};
