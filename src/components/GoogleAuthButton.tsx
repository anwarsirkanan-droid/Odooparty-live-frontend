import React, { useState, useEffect } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle, Settings2, Copy, Check, ExternalLink, ShieldCheck, Terminal, RefreshCw } from 'lucide-react';
import { getActiveGoogleClientId, setActiveGoogleClientId, FALLBACK_GOOGLE_CLIENT_ID } from '../main';
import { oauthDiagnosticsService } from '../services/oauthDiagnosticsService';
import { OAuthDiagnosticLogs } from './OAuthDiagnosticLogs';

interface GoogleAuthButtonProps {
  onSuccess?: (data: any) => void;
  onError?: (errorMessage: string) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ onSuccess, onError }) => {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [newClientId, setNewClientId] = useState(getActiveGoogleClientId());
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const activeClientId = getActiveGoogleClientId();
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  const handleForceRefresh = () => {
    setActiveGoogleClientId(FALLBACK_GOOGLE_CLIENT_ID);
    window.location.reload();
  };

  // Run initial structural audit into diagnostic service
  useEffect(() => {
    try {
      oauthDiagnosticsService.auditClientId(getActiveGoogleClientId());
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      const err = 'Google did not return a valid credential. Please try again.';
      setErrorMsg(err);
      oauthDiagnosticsService.logOAuthError(err, getActiveGoogleClientId(), { credentialResponse });
      onError?.(err);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await googleLogin(credentialResponse.credential);
      oauthDiagnosticsService.log({
        level: 'SUCCESS',
        category: 'BACKEND_EXCHANGE',
        message: 'Google login credential verified successfully by backend.',
        details: { user: data?.user?.email || data?.user?.username },
      });
      onSuccess?.(data);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Google Sign-In failed.';
      setErrorMsg(msg);
      oauthDiagnosticsService.logOAuthError(err, getActiveGoogleClientId(), { stage: 'backend_exchange', message: msg });
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    const err = 'Google OAuth Client ID haaromfamuu barbaada (Error 401: deleted_client / invalid_client). Browser-n kee Client ID duraanii isa haqame qabatee ture. Buttoona "Fuula Haaromsi" cuqaasi!';
    setErrorMsg(err);
    oauthDiagnosticsService.logOAuthError('Google OAuth Error 401', activeClientId, {
      cause: 'Google Identity Services detected deleted/invalid client ID or browser cached previous credentials.',
      activeClientId,
      origin: currentOrigin,
      likelyFix: 'Force reload page to ensure active client ID is bound to Google SDK.',
    });
    onError?.(err);
  };

  const handleCopyOrigin = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(currentOrigin);
      setCopiedOrigin(true);
      setTimeout(() => setCopiedOrigin(false), 2000);
    }
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientId.trim()) return;
    setActiveGoogleClientId(newClientId.trim());
    setSavedSuccess(true);
    setErrorMsg(null);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowConfig(false);
      window.location.reload();
    }, 800);
  };

  return (
    <div className="w-full flex flex-col items-center gap-2.5">
      {/* Real Google Sign-In as Primary Authenticator */}
      {loading ? (
        <div className="w-full py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center gap-2 text-xs text-slate-300 shadow">
          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
          <span>Eeyyama Google Mirkaneessaa jira...</span>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-1.5 shadow-md">
          <div className="w-full flex justify-center [&>div]:w-full [&>div>iframe]:mx-auto">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              theme="filled_black"
              shape="rectangular"
              size="large"
              text="continue_with"
              width="100%"
            />
          </div>
          {/* Active Client ID verification strip */}
          <div className="w-full flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
            <span className="font-mono text-purple-300 truncate max-w-[200px]" title={activeClientId}>
              ID: {activeClientId.slice(0, 15)}...{activeClientId.slice(-18)}
            </span>
            <button
              type="button"
              onClick={handleForceRefresh}
              className="text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold transition-colors"
              title="Browser Cache qulqulleessiitii fuula haaromsi"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Haaromsi</span>
            </button>
          </div>
        </div>
      )}

      {/* Informative Diagnostic Error Banner when Google Client ID is rejected by Google */}
      {errorMsg && (
        <div className="w-full p-3 rounded-2xl bg-red-950/80 border border-red-500/50 flex flex-col gap-2 text-xs text-red-200 animate-fade-in shadow-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block text-red-300">Google OAuth: deleted_client ykn invalid_client</span>
              <p className="text-[11px] text-red-200/90 leading-relaxed">
                Browser kee Client ID duraanii isa haqame qabatee ture. Client ID haaraa <span className="font-mono text-amber-300 font-bold">...fac99s6mk</span> battalatti akka hojjatuuf buttoona armaan gadii cuqaasi:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-500/30">
            <button
              type="button"
              onClick={handleForceRefresh}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold py-1.5 px-3 rounded-xl text-[11px] flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
              <span>Fuula Haaromsi (Refresh Now)</span>
            </button>
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-3 rounded-xl text-[11px] font-medium border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Qindeessi</span>
            </button>
          </div>
        </div>
      )}

      {/* Setup / Configuration & Diagnostics Bar */}
      <div className="w-full flex justify-between items-center px-1 text-[11px]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="text-slate-400 hover:text-purple-300 flex items-center gap-1 transition-colors underline decoration-slate-700"
          >
            <Settings2 className="w-3 h-3 text-purple-400" />
            <span>{showConfig ? 'Cufi Qindeessa' : 'Google Client ID Qindeessi'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDiagnostics(true)}
            className="text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors font-medium"
          >
            <Terminal className="w-3 h-3" />
            <span>Diagnostic Logs</span>
          </button>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Web OAuth 2.0</span>
      </div>

      {/* Configuration Drawer */}
      {showConfig && (
        <div className="w-full p-3.5 bg-slate-950/90 border border-purple-500/30 rounded-2xl text-xs space-y-3 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-purple-300 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Google Cloud OAuth 2.0 Configuration</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDiagnostics(true)}
              className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 bg-purple-950/50 px-2 py-0.5 rounded-lg border border-purple-500/30"
            >
              <Terminal className="w-3 h-3" />
              <span>Full Audit Report</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Google Sign-In hojjachuuf, Google Cloud Console (<a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-purple-400 underline hover:text-purple-300 inline-flex items-center gap-0.5">console.cloud.google.com <ExternalLink className="w-2.5 h-2.5" /></a>) keessatti:
          </p>

          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
            <li><strong>OAuth client ID</strong> (Web application) uumi.</li>
            <li><strong>Authorized JavaScript origins</strong> keessatti URL kana dabali:</li>
          </ol>

          {/* Authorized Origin Copy Box */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl p-2">
            <span className="text-[11px] text-amber-200 font-mono truncate flex-1 select-all">{currentOrigin}</span>
            <button
              type="button"
              onClick={handleCopyOrigin}
              className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors shrink-0"
            >
              {copiedOrigin ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedOrigin ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Paste & Save new Client ID */}
          <form onSubmit={handleSaveClientId} className="space-y-2 pt-1">
            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Google OAuth Client ID Haarawa
            </label>
            <input
              type="text"
              required
              value={newClientId}
              onChange={(e) => setNewClientId(e.target.value)}
              placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
              className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-[11px] font-mono text-white placeholder-slate-600 outline-none"
            />

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Kuusamee Hojiirra Ooleera!</span>
                </>
              ) : (
                <span>Client ID Kuusi & Hojiirra Oolchi</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Diagnostic Logs Modal */}
      <OAuthDiagnosticLogs
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />
    </div>
  );
};

export default GoogleAuthButton;
