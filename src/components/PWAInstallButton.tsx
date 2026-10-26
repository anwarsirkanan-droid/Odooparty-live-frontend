import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, CheckCircle, X, Share2, PlusSquare } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running in standalone mode on phone
  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="font-semibold">OdooParty App bilbila keessan irratti buufameera (Installed)!</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-slate-900 border border-purple-500/40 shadow-xl space-y-2.5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-md shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">App Dhugaa Bilbila Irraatti (Mobile App)</h4>
            <p className="text-[11px] text-purple-200/80 leading-relaxed mt-0.5">
              OdooParty akkuma App dhugaatti (full screen, screen bilbilaa irratti) buufachuun ni danda'ama.
            </p>
          </div>
        </div>

        {isInstallable ? (
          <button
            onClick={install}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Bilbila Keessan Irratti Buufadhaa (Install App)</span>
          </button>
        ) : (
          <button
            onClick={() => setShowGuide(true)}
            className="w-full bg-purple-900/60 hover:bg-purple-800/60 border border-purple-500/40 text-purple-200 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Akkaataa App Itti Ta'u Ilaali (Install Guide)</span>
          </button>
        )}
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-5 w-full max-w-sm shadow-2xl relative text-xs">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Akkaataa Bilbila Irratti Buufatan</span>
            </h3>

            {isIOS ? (
              <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                <p>iPhone / iPad irratti Safari fayyadamaa:</p>
                <div className="bg-slate-800 p-2.5 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <Share2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>1. Mallattoo "Share" tuqaa</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <PlusSquare className="w-3.5 h-3.5 text-pink-400" />
                    <span>2. "Add to Home Screen" filadhaa</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                <p>Android Chrome irratti:</p>
                <div className="bg-slate-800 p-2.5 rounded-xl space-y-1.5">
                  <div>1. Browser Chrome keessaa qaree sadii (⋮) mirga gubbaa tuqaa.</div>
                  <div className="text-amber-300 font-bold">2. <strong>"Install App"</strong> ykn <strong>"Add to Home screen"</strong> tuqaa.</div>
                  <div>3. Sana booda screen bilbila keessanii irratti akka App dhugaatti taa'a!</div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-xl text-xs"
            >
              Cufi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
