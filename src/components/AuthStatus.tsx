import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMedalCategory } from '../utils/constants';
import {
  ShieldCheck,
  ShieldAlert,
  Coins,
  Sparkles,
  Award,
  Crown,
  Settings,
  ArrowDownLeft,
  ArrowUpRight,
  LogIn,
  LogOut,
  Copy,
  Check,
  Key,
  Flame,
  Radio,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface AuthStatusProps {
  onOpenAuth: () => void;
  onOpenWallet?: () => void;
  onOpenRecharge?: () => void;
  onOpenWithdraw?: () => void;
  onOpenLevels?: () => void;
  onOpenSettings?: () => void;
  onOpenVerification?: () => void;
  onOpenHostCenter?: () => void;
}

export const AuthStatus: React.FC<AuthStatusProps> = ({
  onOpenAuth,
  onOpenWallet,
  onOpenRecharge,
  onOpenWithdraw,
  onOpenLevels,
  onOpenSettings,
  onOpenVerification,
  onOpenHostCenter,
}) => {
  const { user, token, logout, isLoading } = useAuth();
  const [copiedId, setCopiedId] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Strictly check if token is present and non-empty
  const hasToken = Boolean(token && token.trim().length > 0);

  const handleCopyId = (idStr: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(idStr);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCopyToken = () => {
    if (token && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  // Masked token preview for security
  const maskedToken = token
    ? token.length > 20
      ? `${token.slice(0, 8)}••••••••${token.slice(-6)}`
      : token
    : null;

  // -------------------------------------------------------------
  // STATE 1: SIGN IN VIEW (When token is NOT present)
  // -------------------------------------------------------------
  if (!hasToken) {
    return (
      <div className="w-full rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 shadow-2xl p-5 relative overflow-hidden animate-fade-in">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Status Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm">
            <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Auth State: Keessummaa (Unauthenticated)</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
            <span>Token: None</span>
          </div>
        </div>

        {/* Hero Guest Card */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center font-bold text-slate-400 text-xl shadow-inner">
              ?
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <span className="text-[9px] text-slate-950 font-black">!</span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-white tracking-tight">Akkaawuntii Hin Qabdu</h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">
              Kutaa sagalee banachuuf, maallaqa kuufachuuf fi badhaasa argachuuf seensa dhugaa godhi.
            </p>
          </div>
        </div>

        {/* Account Benefits Checklist */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 mb-4 text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>Kutaa 25-seat banadhu</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Coins & Badhaasa kuusi</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Crown className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span>VIP Host & Agency ta'i</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Dhugoomsaa Mirkanaa'e</span>
          </div>
        </div>

        {/* Primary Call to Action: Sign In Button */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={onOpenAuth}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-purple-900/40 active:scale-[0.98] transition-all"
          >
            <LogIn className="w-4 h-4 text-white" />
            <span className="text-sm">Seensa Dhugaa / Sign In</span>
          </button>

          <p className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Google OAuth 2.0 & Email Verified • Soba Hin Qabu</span>
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 2: PROFILE DETAILS VIEW (When token is PRESENT)
  // -------------------------------------------------------------
  const wealthLvl = user?.wealthLevel?.level || 1;
  const charmLvl = user?.charmLevel?.level || 1;
  const wealthMedal = getMedalCategory(wealthLvl);
  const charmMedal = getMedalCategory(charmLvl);
  const userDisplayId = String(user?.customId || user?.publicId || '1000001');

  return (
    <div className="w-full rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 border border-purple-500/30 shadow-2xl p-4 relative overflow-hidden animate-fade-in">
      {/* Background radial highlights */}
      <div className="absolute -top-14 -right-14 w-40 h-40 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-14 -left-14 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Auth Status Indicator + Settings + Logout */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3.5">
        {/* Visual Login State Badge */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dhugoomfateera (Authenticated)</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="p-1.5 rounded-xl bg-slate-800/80 text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
            title="Sign Out / Bahi"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User Identity Header */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3">
          {/* Avatar with status dot */}
          <div className="relative shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/40 shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-400 flex items-center justify-center font-black text-white text-lg shadow-lg">
                {(user?.username || 'User').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div
              className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center"
              title="Verified Active"
            >
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Name & Badges */}
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-white tracking-tight">
                {user?.name || user?.username || 'Authenticated User'}
              </h3>
              {user?.countryFlag && (
                <span className="text-sm" title={user?.country || ''}>
                  {user.countryFlag}
                </span>
              )}
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 font-black text-[9px] px-1.5 py-0.5 rounded uppercase">
                {user?.role || 'USER'}
              </span>
              {user?.isVerified && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Crown className="w-2.5 h-2.5 text-amber-400" />
                  <span>VIP</span>
                </span>
              )}
            </div>

            {/* Email / Username */}
            <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
              {user?.email || `${user?.username}@meso.live`}
            </div>

            {/* User ID with copy button */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
              <span className="font-mono">ID: {userDisplayId}</span>
              <button
                type="button"
                onClick={() => handleCopyId(userDisplayId)}
                className="text-slate-500 hover:text-purple-300 transition-colors p-0.5"
                title="Copy User ID"
              >
                {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Social Stats: Following / Followers */}
        <div className="flex flex-col items-end text-right text-[11px] text-slate-400 shrink-0">
          <div>
            <strong className="text-white font-bold">{user?.followingCount ?? 28}</strong>{' '}
            <span className="text-slate-400">Following</span>
          </div>
          <div>
            <strong className="text-white font-bold">{user?.followersCount ?? 142}</strong>{' '}
            <span className="text-slate-400">Followers</span>
          </div>
        </div>
      </div>

      {/* Live Token & Security Banner */}
      <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-1.5 mb-3.5 text-[10px]">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono">
          <Key className="w-3 h-3 text-emerald-400" />
          <span className="text-slate-500">JWT Token:</span>
          <span className="text-emerald-300 font-medium select-all">{maskedToken}</span>
        </div>
        <button
          type="button"
          onClick={handleCopyToken}
          className="text-purple-400 hover:text-purple-300 text-[10px] flex items-center gap-1 font-medium transition-colors"
        >
          {copiedToken ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Primary Financial Overview: Coins, Points, Wealth Lv */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {/* Coins */}
        <button
          type="button"
          onClick={onOpenWallet}
          className="flex flex-col items-center p-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-amber-500/30 transition-all text-center group"
        >
          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 mb-0.5">
            <Coins className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Coins</span>
          </div>
          <span className="text-base font-black text-amber-300">
            {(user?.coins || 0).toLocaleString()}
          </span>
        </button>

        {/* Points */}
        <button
          type="button"
          onClick={onOpenWithdraw}
          className="flex flex-col items-center p-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-purple-500/30 transition-all text-center group"
        >
          <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-300 mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>Points</span>
          </div>
          <span className="text-base font-black text-purple-300">
            {(user?.points || 0).toLocaleString()}
          </span>
        </button>

        {/* Levels */}
        <button
          type="button"
          onClick={onOpenLevels}
          className="flex flex-col items-center p-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-pink-500/30 transition-all text-center group"
        >
          <div className="flex items-center gap-1 text-[11px] font-semibold text-pink-300 mb-0.5">
            <Award className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
            <span>Levels</span>
          </div>
          <span className="text-base font-black text-white">Lv.{wealthLvl}</span>
        </button>
      </div>

      {/* Quick Recharge & Withdraw Buttons */}
      <div className="flex gap-2">
        {onOpenRecharge && (
          <button
            type="button"
            onClick={onOpenRecharge}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Recharge</span>
          </button>
        )}
        {onOpenWithdraw && (
          <button
            type="button"
            onClick={onOpenWithdraw}
            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Withdraw</span>
          </button>
        )}
      </div>

      {/* Host Verification status banner */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300">
            Host: <strong className="text-emerald-300">{user?.hostVerificationStatus || 'Approved'}</strong>
          </span>
        </div>
        {onOpenHostCenter && (
          <button
            type="button"
            onClick={onOpenHostCenter}
            className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-0.5 transition-colors"
          >
            <span>Host Center</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
          <LogOut className="w-8 h-8 text-red-400 mb-2" />
          <h4 className="text-sm font-bold text-white mb-1">OdooParty Keessaa Ba'uu Barbaaddaa?</h4>
          <p className="text-xs text-slate-400 mb-4">
            Token fi seensi kee haalamee akka keessummaatti deebita.
          </p>
          <div className="flex gap-2 w-full max-w-xs">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Dhiisi (Cancel)
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg"
            >
              Eeyyee, Ba'i (Sign Out)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthStatus;
