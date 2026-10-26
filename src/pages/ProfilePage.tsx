import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Copy,
  Check,
  ChevronRight,
  Star,
  Heart,
  Shield,
  Coins,
  Sparkles,
  Mic,
  Users,
  Award,
  Headphones,
  Settings,
  ShoppingBag,
  Rocket,
  CheckCircle2,
  LogIn,
  Backpack as BackpackIcon,
  HelpCircle,
  X,
} from 'lucide-react';
import { PWAInstallButton } from '../components/PWAInstallButton';

interface ProfilePageProps {
  onOpenAuth: () => void;
  onOpenWallet: () => void;
  onOpenRecharge: () => void;
  onOpenWithdraw: () => void;
  onOpenHostCenter: () => void;
  onOpenAgency: () => void;
  onOpenCoinSeller: () => void;
  onOpenLevels: () => void;
  onOpenTasks: () => void;
  onOpenVerification: () => void;
  onOpenInvitation: () => void;
  onOpenSettings: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onOpenAuth,
  onOpenWallet,
  onOpenRecharge,
  onOpenWithdraw,
  onOpenHostCenter,
  onOpenAgency,
  onOpenCoinSeller,
  onOpenLevels,
  onOpenTasks,
  onOpenVerification,
  onOpenInvitation,
  onOpenSettings,
}) => {
  const { user, token, isAuthenticated } = useAuth();
  const [copiedId, setCopiedId] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [supportText, setSupportText] = useState('');

  const handleCopyId = (idStr: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(idStr);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const currentId = user?.customId || user?.publicId || '1000001';
  const wealthLvl = user?.wealthLevel?.level || 38;
  const charmLvl = user?.charmLevel?.level || 34;
  const userRole = user?.role === 'HOST' ? 'Host' : user?.isAgent ? 'Agent' : 'VIP';

  // Format currency displays
  const formattedCoins = (user?.coins ?? 50000).toLocaleString();
  const pointsVal = user?.points ?? 15000;
  const formattedPoints = pointsVal >= 1000 ? `${(pointsVal / 1000).toFixed(2)}k` : pointsVal.toString();

  return (
    <div className="pb-24 px-3 max-w-md mx-auto w-full space-y-3 pt-2 select-none">
      {/* 1. Header Profile Card */}
      <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-purple-500/20 rounded-3xl p-4 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3">
          {/* Avatar with Golden Ornate Rim Frame */}
          <div className="relative shrink-0">
            <div className="w-18 h-18 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 border-2 border-slate-900">
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                  }
                  alt={user?.name || 'User Profile'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* VIP / Verification badge on avatar */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-[10px] shadow border border-slate-900">
              ✓
            </div>
          </div>

          {/* User Information & Badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <h2 className="text-base font-extrabold text-white tracking-tight truncate">
                  {user?.name || user?.username || 'Anu jirra'}
                </h2>
                <span className="text-base shrink-0" title={user?.country || 'Ethiopia'}>
                  {user?.countryFlag || '🇪🇹'}
                </span>
              </div>
              <button
                onClick={isAuthenticated ? onOpenSettings : onOpenAuth}
                className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0"
                title="Profile Details / Settings"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* ID & Copy Button */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-mono text-slate-400 font-medium">ID: {currentId}</span>
              <button
                type="button"
                onClick={() => handleCopyId(String(currentId))}
                className="text-slate-400 hover:text-amber-300 transition-colors"
                title="Copy ID"
              >
                {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            {/* Level & Role Badges in a Row (Tello Style) */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {/* Gender & Age / Level Pill */}
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[10px] shadow-sm">
                <span>♂</span>
                <span>33</span>
              </div>

              {/* Wealth Level Star Pill */}
              <button
                onClick={onOpenLevels}
                className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-extrabold text-[10px] shadow-sm hover:scale-105 transition-transform"
                title="Wealth Level"
              >
                <Star className="w-2.5 h-2.5 fill-white" />
                <span>{wealthLvl}</span>
              </button>

              {/* Charm Level Heart Pill */}
              <button
                onClick={onOpenLevels}
                className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-[10px] shadow-sm hover:scale-105 transition-transform"
                title="Charm Level"
              >
                <Heart className="w-2.5 h-2.5 fill-white" />
                <span>{charmLvl}</span>
              </button>

              {/* Metallic Role Badge */}
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-600 text-slate-200 font-bold text-[10px] shadow-sm">
                <Shield className="w-2.5 h-2.5 text-amber-400" />
                <span>{userRole}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Follow Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
          {/* Followed with mini bubble avatars */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1.5 overflow-hidden">
                <img
                  className="inline-block h-4 w-4 rounded-full ring-1 ring-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50"
                  alt=""
                />
                <img
                  className="inline-block h-4 w-4 rounded-full ring-1 ring-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50"
                  alt=""
                />
              </div>
              <span className="text-xs font-black text-white">{user?.followingCount || 638}</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Followed</span>
          </div>

          {/* Fans */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-white">{user?.followersCount || 2693}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Fans</span>
          </div>

          {/* Friends */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-white">485</span>
            <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Friends</span>
          </div>
        </div>

        {/* Guest sign-in banner if not authenticated */}
        {!isAuthenticated && (
          <div className="mt-3 p-2.5 rounded-2xl bg-purple-950/70 border border-purple-500/40 flex items-center justify-between gap-2">
            <span className="text-xs text-purple-200">Akkaawuntii keetiin seentee qabeenya kee kuufadhu!</span>
            <button
              onClick={onOpenAuth}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow flex items-center gap-1 shrink-0"
            >
              <LogIn className="w-3 h-3" />
              <span>Seeni</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. VIP Club Banner (Tello Carbon Style) */}
      <div
        onClick={onOpenLevels}
        className="cursor-pointer rounded-2xl p-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-amber-400/50 transition-all"
      >
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
        <div className="relative space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="italic font-black text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              VIP Club
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-[10px] text-slate-300 font-medium">
            Upgrade to VIP and get free coins daily
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenLevels();
          }}
          className="relative px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform"
        >
          Get VIP
        </button>
      </div>

      {/* 3. Coins & Points (2 Side-by-Side Cards - Tello Style) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Coins Card */}
        <div
          onClick={onOpenRecharge}
          className="cursor-pointer p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center justify-between shadow-md hover:border-amber-400/50 transition-all group"
        >
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Coins</span>
            <span className="text-lg font-black text-amber-400 block tracking-tight group-hover:scale-102 transition-transform">
              {formattedCoins}
            </span>
          </div>

          {/* 3D Golden Star Badge */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
            <Star className="w-6 h-6 fill-amber-900 text-amber-900" />
          </div>
        </div>

        {/* Points Card */}
        <div
          onClick={onOpenWithdraw}
          className="cursor-pointer p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 flex items-center justify-between shadow-md hover:border-purple-400/50 transition-all group"
        >
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Points</span>
            <span className="text-lg font-black text-purple-300 block tracking-tight group-hover:scale-102 transition-transform">
              {formattedPoints}
            </span>
          </div>

          {/* 3D Purple Diamond / Gem Token Badge */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
            <div className="w-5 h-5 rounded-md bg-white/90 rotate-45 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Service Center Row (3 Main Cards: Host Center, Agency, Coin Seller) */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 shadow-md">
        {/* Host Center */}
        <button
          onClick={onOpenHostCenter}
          className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-800/60 transition-colors group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-110 transition-transform mb-1.5">
            <Mic className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-200">Host Center</span>
        </button>

        {/* Agency */}
        <button
          onClick={onOpenAgency}
          className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-800/60 transition-colors group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform mb-1.5">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-200">Agency</span>
        </button>

        {/* Coin Seller */}
        <button
          onClick={onOpenCoinSeller}
          className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-800/60 transition-colors group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform mb-1.5">
            <Coins className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-200">Coin Seller</span>
        </button>
      </div>

      {/* 5. Feature Grid (2 Rows of 4 Items = 8 Icons - Tello Style) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-3.5 shadow-md">
        <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
          {/* Row 1 */}
          {/* Task */}
          <button
            onClick={onOpenTasks}
            className="flex flex-col items-center group"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-1 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300">Task</span>
          </button>

          {/* Invite */}
          <button
            onClick={onOpenInvitation}
            className="flex flex-col items-center group"
          >
            <div className="w-10 h-10 rounded-2xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-1 group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 fill-pink-500/30" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300">Invite</span>
          </button>

          {/* Store */}
          <button
            onClick={onOpenRecharge}
            className="flex flex-col items-center group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-1 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300">Store</span>
          </button>

          {/* Backpack */}
          <button
            onClick={onOpenWallet}
            className="flex flex-col items-center group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-1 group-hover:scale-110 transition-transform">
              <BackpackIcon className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300">Backpack</span>
          </button>

          {/* Row 2 */}
          {/* Level */}
          <button
            onClick={onOpenLevels}
            className="flex flex-col items-center group"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-1 group-hover:scale-110 transition-transform">
              <Rocket className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300">Level</span>
          </button>

          {/* Medal Wall */}
          <button
            onClick={onOpenLevels}
            className="flex flex-col items-center group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300">Medal Wall</span>
          </button>

          {/* Support */}
          <button
            onClick={() => setShowSupportModal(true)}
            className="flex flex-col items-center group"
          >
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-1 group-hover:scale-110 transition-transform">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300">Support</span>
          </button>

          {/* Setting */}
          <button
            onClick={onOpenSettings}
            className="flex flex-col items-center group"
          >
            <div className="w-10 h-10 rounded-2xl bg-slate-700/30 border border-slate-600/40 flex items-center justify-center text-slate-300 mb-1 group-hover:scale-110 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300">Setting</span>
          </button>
        </div>
      </div>

      {/* 6. PWA Mobile Install Banner */}
      <PWAInstallButton />

      {/* Support / Help Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 w-full max-w-sm shadow-2xl relative space-y-3">
            <button
              onClick={() => {
                setShowSupportModal(false);
                setSupportSubmitted(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">OdooParty Support 24/7</h3>
                <span className="text-[10px] text-cyan-300">Tajaajila Deeggarsa Maamiltootaa</span>
              </div>
            </div>

            {supportSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <span className="text-xs font-bold text-white block">Ergaan Kee Qaqqabeera!</span>
                <p className="text-[11px] text-emerald-300">
                  Gareen deeggarsa OdooParty daqiiqaa muraasa keessatti siif deebisu.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Rakkoo qabeenyaa, kutaa sagalee, ykn akkaawuntii yoo qabaatte asitti nuuf barreessi:
                </p>
                <textarea
                  rows={3}
                  value={supportText}
                  onChange={(e) => setSupportText(e.target.value)}
                  placeholder="Yaada ykn rakkoo kee asitti barreessi..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none resize-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (supportText.trim()) {
                      setSupportSubmitted(true);
                    }
                  }}
                  className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
                >
                  Ergi (Submit Ticket)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
