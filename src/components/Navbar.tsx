import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Coins, Sparkles, Diamond, Mic, Volume2, Settings } from 'lucide-react';
import { VoiceRoom } from '../types';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenWallet: () => void;
  onOpenLevels: () => void;
  onOpenSettings?: () => void;
  activeRoom: VoiceRoom | null;
  onReturnToRoom: () => void;
  isMinimized: boolean;
  currentTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenWallet,
  onOpenLevels,
  onOpenSettings,
  activeRoom,
  onReturnToRoom,
  isMinimized,
  currentTab,
}) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-purple-900/20 px-3 py-2.5 max-w-md mx-auto w-full transition-all">
      <div className="flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300 tracking-tight text-base leading-none">
              OdooParty
            </span>
            <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
              Live
            </span>
          </div>
        </div>

        {/* Currency & User Actions */}
        <div className="flex items-center gap-1.5">
          {isAuthenticated && user && currentTab !== 'profile' ? (
            <>
              {/* Coins chip */}
              <button
                onClick={onOpenWallet}
                className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-800 border border-amber-500/30 px-2 py-1 rounded-full text-xs font-semibold text-amber-300 transition-colors shadow-sm"
                title="Coins Balance"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{(user.coins || 0).toLocaleString()}</span>
              </button>

              {/* Diamonds chip */}
              <button
                onClick={onOpenWallet}
                className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-800 border border-cyan-500/30 px-2 py-1 rounded-full text-xs font-semibold text-cyan-300 transition-colors shadow-sm"
                title="Diamonds Balance"
              >
                <Diamond className="w-3.5 h-3.5 text-cyan-400" />
                <span>{(user.diamonds || 0).toLocaleString()}</span>
              </button>

              {/* Wealth & Charm Badges */}
              <button
                onClick={onOpenLevels}
                className="flex items-center gap-1 bg-purple-950/70 hover:bg-purple-900/50 border border-purple-500/40 px-2 py-1 rounded-full text-xs text-purple-300 font-medium transition-colors"
                title="Wealth & Charm Levels"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Lv.{user.wealthLevel?.level || 1}</span>
              </button>
            </>
          ) : (
            <button
              onClick={onOpenSettings || onOpenAuth}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              title="Settings & Account"
            >
              <Settings className="w-4 h-4 text-purple-400" />
            </button>
          )}
        </div>
      </div>

      {/* Floating mini-player if minimized live room */}
      {activeRoom && isMinimized && (
        <div
          onClick={onReturnToRoom}
          className="mt-2 flex items-center justify-between bg-gradient-to-r from-purple-900/90 to-slate-900/90 border border-purple-500/40 rounded-xl px-3 py-1.5 cursor-pointer shadow-lg animate-pulse"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold text-purple-100 truncate">
              Live: {activeRoom.title}
            </span>
          </div>
          <div className="flex items-center gap-2 text-purple-300 text-[11px] font-medium">
            <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Tap to Return</span>
          </div>
        </div>
      )}
    </header>
  );
};
