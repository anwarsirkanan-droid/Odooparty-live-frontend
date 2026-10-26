import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Settings, Volume2, Shield, LogOut, Moon, User, Radio, LogIn, Terminal, Server, CheckCircle2 } from 'lucide-react';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { OAuthDiagnosticLogs } from '../components/OAuthDiagnosticLogs';
import { BACKEND_SERVERS } from '../utils/constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lowLatencyAudio, setLowLatencyAudio] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-5 w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300">
              <Settings className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">App Settings</h2>
              <span className="text-[11px] text-slate-400">Audio, Preferences & Mobile App</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3 py-2 text-xs">
          {/* Mobile App Install Button */}
          <PWAInstallButton />

          {/* Login Card inside Settings if not logged in */}
          {!isAuthenticated || !user ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/70 via-slate-900 to-pink-950/70 border border-purple-500/40 text-center space-y-2.5 shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 mx-auto flex items-center justify-center text-white shadow-md">
                <LogIn className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block">OdooParty Account</span>
              <p className="text-[11px] text-purple-200/80">
                Sign in to save your coins, host mic privileges, points, and wallet.
              </p>
              
              {/* One-Tap Google Sign-In */}
              <div className="pt-1">
                <GoogleAuthButton
                  onSuccess={() => {
                    onClose();
                  }}
                />
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <div className="h-px bg-slate-800 flex-1" />
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Or use password</span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full bg-slate-800 hover:bg-slate-750 text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <LogIn className="w-4 h-4 text-purple-400" />
                <span>Sign In with Username / Email</span>
              </button>
            </div>
          ) : null}

          {/* Audio controls */}
          <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/80 space-y-3">
            <span className="text-xs font-bold text-white block">Voice Room Audio</span>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span>Gift & Game Sound Effects</span>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Ultra-Low Latency Audio Mode</span>
              </div>
              <input
                type="checkbox"
                checked={lowLatencyAudio}
                onChange={(e) => setLowLatencyAudio(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Account Security & Role */}
          <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/80 space-y-2">
            <span className="text-xs font-bold text-white block">Account Information</span>
            <div className="flex justify-between text-slate-300">
              <span>Status:</span>
              <span className={`font-bold ${isAuthenticated ? 'text-emerald-400' : 'text-slate-400'}`}>
                {isAuthenticated ? 'Authenticated' : 'Guest'}
              </span>
            </div>
            {user && (
              <>
                <div className="flex justify-between text-slate-300">
                  <span>Username:</span>
                  <span className="font-bold text-white">{user.username}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Public ID:</span>
                  <span className="font-mono text-purple-300">{user.customId || user.publicId || '1000004'}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Role:</span>
                  <span className="font-extrabold text-amber-400">{user.role || 'USER'}</span>
                </div>
              </>
            )}
          </div>

          {/* Render & Backend Servers Status */}
          <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Server className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Render Backends & Deployment</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Render Safe
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {BACKEND_SERVERS.map((srv) => (
                <div
                  key={srv.id}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-200">{srv.name}</span>
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                        srv.id === 'odooparty'
                          ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {srv.type}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-300 truncate">{srv.url}</span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    <span>{srv.note}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 italic bg-slate-900/40 p-2 rounded-lg border border-slate-800">
              🛡️ <strong>Hubadhaa:</strong> Tajaajilli <code>meso-live-backend.onrender.com</code> Render dashboard keessan keessaa gonkumaa hin haqamne, akkuma jirutti eegamee jiraata.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold py-2 rounded-xl border border-purple-500/30 flex items-center justify-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Switch Account / Sign In as Other</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-950/70 hover:bg-red-900/70 text-red-300 border border-red-500/40 font-semibold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold py-2 rounded-xl border border-purple-500/30 flex items-center justify-center gap-2 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Go to Login / Register</span>
              </button>
            )}

            {/* Google OAuth Diagnostics Inspector Button */}
            <button
              type="button"
              onClick={() => setShowDiagnostics(true)}
              className="w-full bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 hover:text-white border border-purple-500/30 font-medium py-2 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors"
            >
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Google OAuth Diagnostics & Logs</span>
            </button>
          </div>
        </div>

        {/* OAuth Diagnostics Modal */}
        <OAuthDiagnosticLogs
          isOpen={showDiagnostics}
          onClose={() => setShowDiagnostics(false)}
        />
      </div>
    </div>
  );
};
