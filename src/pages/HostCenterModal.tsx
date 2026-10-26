import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ChevronLeft,
  Crown,
  Clock,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  Radio,
  X,
  Flame,
  Award,
  BookOpen,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { HostPolicyModal, HOST_LEVEL_TIERS } from './HostPolicyModal';

interface HostCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVerification: () => void;
  onJoinRoom?: (room: any) => void;
  onOpenHostPolicy?: () => void;
  onOpenTaskCenter?: () => void;
}

export const HostCenterModal: React.FC<HostCenterModalProps> = ({
  isOpen,
  onClose,
  onOpenVerification,
  onJoinRoom,
  onOpenHostPolicy,
  onOpenTaskCenter,
}) => {
  const { user } = useAuth();
  const [copiedId, setCopiedId] = useState(false);
  const [dateFilter, setDateFilter] = useState<'today' | '6days' | '29days'>('today');
  const [currentTime, setCurrentTime] = useState('');
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (UTC+3)'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const currentId = user?.customId || user?.publicId || '1000001';
  const hostName = user?.name || user?.username || 'Host Leader';
  const pointsTotal = user?.points || 15000;
  const diamondsTotal = user?.diamonds || 2000;

  const handleCopyId = () => {
    navigator.clipboard?.writeText(String(currentId));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleOpenMyRoom = () => {
    const myRoom = {
      _id: 'room_host_' + currentId,
      title: `🎙️ ${hostName}'s VIP Lounge`,
      topic: 'Live Social Audio & Gifting',
      hostId: user?._id || 'host_user',
      hostName,
      category: 'Chat & Music',
      onlineCount: 8,
      isLive: true,
      createdAt: new Date().toISOString(),
      seats: Array.from({ length: 25 }, (_, i) => ({
        seatIndex: i,
        isHostSeat: i === 0,
        isCrownMic: i >= 1 && i <= 4,
        user: i === 0 ? user : null,
        isMuted: false,
        isLocked: false,
      })),
    };
    onJoinRoom?.(myRoom);
    onClose();
  };

  const handleOpenAgencyRoom = () => {
    const agencyRoom = {
      _id: 'room_agency_main',
      title: '🏢 OdooParty Agency Headquarters',
      topic: 'Team Voice Party & Host Coaching',
      hostId: 'agency_host',
      hostName: 'Agency Manager',
      category: 'Party',
      onlineCount: 24,
      isLive: true,
      createdAt: new Date().toISOString(),
      seats: Array.from({ length: 25 }, (_, i) => ({
        seatIndex: i,
        isHostSeat: i === 0,
        isCrownMic: i >= 1 && i <= 4,
        user: null,
        isMuted: false,
        isLocked: false,
      })),
    };
    onJoinRoom?.(agencyRoom);
    onClose();
  };

  // Compute metrics depending on date filter
  const multiplier = dateFilter === 'today' ? 1 : dateFilter === '6days' ? 6 : 28;
  const displayedTotal = (pointsTotal * multiplier).toLocaleString();
  const displayedGifts = (diamondsTotal * multiplier).toLocaleString();
  const displayedOther = (pointsTotal * multiplier).toLocaleString();

  // Dynamic Host Level Tier calculation (S to L) from 7-day points
  const hostPoints7D = diamondsTotal;
  const currentTier = HOST_LEVEL_TIERS.find((t) => hostPoints7D >= t.minPoints) || HOST_LEVEL_TIERS[HOST_LEVEL_TIERS.length - 1];
  const currentTierIndex = HOST_LEVEL_TIERS.findIndex((t) => t.level === currentTier.level);
  const nextTier = currentTierIndex > 0 ? HOST_LEVEL_TIERS[currentTierIndex - 1] : null;
  const pointsToNext = nextTier ? Math.max(0, nextTier.minPoints - hostPoints7D) : 0;
  const progressPercent = nextTier ? Math.min(100, Math.max(5, (hostPoints7D / nextTier.minPoints) * 100)) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-950 border border-purple-500/30 rounded-3xl w-full max-w-md shadow-2xl relative flex flex-col h-[92vh] max-h-[820px] overflow-hidden text-slate-100 select-none">
        {/* 1. Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/90 shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-sm font-extrabold text-white tracking-wide">Host Center</h2>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowPolicyModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-[10px] font-bold transition-all"
              title="Official Host Policy"
            >
              <FileText className="w-3 h-3 text-amber-400" />
              <span>Policy</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400">
              <Crown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-3 space-y-3 pb-20">
          {/* 2. Start Streaming & Earn Rewards Banner (Tello Style) */}
          <div className="relative rounded-2xl overflow-hidden p-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 shadow-lg text-white">
            <div className="relative z-10 max-w-[260px]">
              <span className="text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded bg-black/30 inline-block mb-1">
                Live Host Portal
              </span>
              <h3 className="text-base font-black tracking-tight leading-tight drop-shadow-md">
                Start Streaming & Earn Rewards
              </h3>
              <p className="text-[11px] font-medium text-pink-100 mt-1">
                Crown mic hourly points up to <strong className="text-yellow-300">2,000,000/h!</strong> (New: 80k/h)
              </p>
              <button
                onClick={() => setShowPolicyModal(true)}
                className="mt-2.5 px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 border border-white/20 text-[10px] font-black text-amber-200 flex items-center gap-1 transition-colors"
              >
                <span>Official Host Policy (S-L)</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* VIP Entrance Ticker Bar */}
            <div className="mt-3 py-1 px-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-[10px]">
              <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[9px]">
                VIP6
              </span>
              <span className="text-slate-200 truncate">Anwar entered OdooParty Live</span>
              <Sparkles className="w-3 h-3 text-amber-300 ml-auto shrink-0" />
            </div>
          </div>

          {/* 3. Agent Strip (Tello Style) */}
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-purple-300 font-semibold">Your Agent:</span>
              <span className="font-bold text-white">OdooParty Premier</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-purple-200">
              <span>ID: 1008149</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 4. Host Family Card (Tello Style) */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Golden Rim Frame Avatar */}
                <div className="w-13 h-13 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-md shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <span>{hostName} Family</span>
                    <span className="px-1.5 py-0.2 rounded font-black text-[9px] bg-amber-400 text-slate-950">
                      Tier {currentTier.level}
                    </span>
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                    <span>ID: {currentId}</span>
                    <button onClick={handleCopyId} className="hover:text-amber-300">
                      {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3 text-amber-400" />
                <span className="font-mono">{currentTime || '16:22'}</span>
              </div>
            </div>

            {/* Incomes Row: Gift Income & Hourly Income */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-center border-t border-slate-800/80">
              <div>
                <span className="text-base font-black text-white block">{(diamondsTotal || 0).toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 font-medium">Gift Income (Last 7 days)</span>
              </div>

              <div>
                <span className="text-base font-black text-amber-400 block">{currentTier.rewardPerHour.toLocaleString()}/h</span>
                <span className="text-[10px] text-slate-400 font-medium">Hourly income ({currentTier.hoursPerDay}h/day max)</span>
              </div>
            </div>

            {/* Target Progress Bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="text-[11px] text-slate-300 font-medium">
                  {nextTier ? (
                    <>
                      <strong className="text-white">{pointsToNext.toLocaleString()}</strong> more points to reach <span className="text-amber-400 font-bold">Level {nextTier.level} ({nextTier.rewardPerHour.toLocaleString()}/h)</span>
                    </>
                  ) : (
                    <span className="text-amber-300 font-bold">Top Level S Achieved! (2,000,000/h)</span>
                  )}
                </span>
                <button
                  onClick={() => setShowPolicyModal(true)}
                  className="text-[11px] text-slate-400 hover:text-purple-300 flex items-center gap-0.5"
                >
                  <span>Policy</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="h-1.5 bg-slate-800 rounded-full relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
                <span>{currentTier.minPoints.toLocaleString()}</span>
                <span>{nextTier ? nextTier.minPoints.toLocaleString() : '500,000,000+'}</span>
              </div>
            </div>
          </div>

          {/* 5. Points Income Card (Tello Style) */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-white">Points Income</h4>
              <button
                onClick={() => setShowPolicyModal(true)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-0.5"
              >
                <span>Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Date Filters: [Today] [Previous 6 Days] [Previous 29 Days] */}
            <div className="flex gap-2">
              <button
                onClick={() => setDateFilter('today')}
                className={`flex-1 py-1 px-2 rounded-full text-[11px] font-bold transition-all ${
                  dateFilter === 'today'
                    ? 'bg-white text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter('6days')}
                className={`flex-1 py-1 px-2 rounded-full text-[11px] font-bold transition-all ${
                  dateFilter === '6days'
                    ? 'bg-white text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Previous 6 Days
              </button>
              <button
                onClick={() => setDateFilter('29days')}
                className={`flex-1 py-1 px-2 rounded-full text-[11px] font-bold transition-all ${
                  dateFilter === '29days'
                    ? 'bg-white text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Previous 29 Days
              </button>
            </div>

            {/* 6 Metrics Grid (3 cols x 2 rows) */}
            <div className="grid grid-cols-3 gap-y-3 gap-x-2 pt-2 text-center">
              <div>
                <span className="text-xs font-black text-white block">{displayedTotal}</span>
                <span className="text-[10px] text-slate-400">Total Income</span>
              </div>
              <div>
                <span className="text-xs font-black text-white block">0</span>
                <span className="text-[10px] text-slate-400">Base Salary</span>
              </div>
              <div>
                <span className="text-xs font-black text-white block">{displayedGifts}</span>
                <span className="text-[10px] text-slate-400">Gifts</span>
              </div>

              <div>
                <span className="text-xs font-black text-white block">0</span>
                <span className="text-[10px] text-slate-400">Invitation</span>
              </div>
              <div>
                <span className="text-xs font-black text-white block">50</span>
                <span className="text-[10px] text-slate-400">Tasks</span>
              </div>
              <div>
                <span className="text-xs font-black text-white block">{displayedOther}</span>
                <span className="text-[10px] text-slate-400">Other</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Bottom Navigation Action Buttons (Agency Room & My Room - Tello Style) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md flex items-center gap-3">
          <button
            onClick={handleOpenAgencyRoom}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
          >
            <span>Agency Room</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={handleOpenMyRoom}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 transition-transform active:scale-95"
          >
            <span>My Room</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Official Host Policy Modal */}
        <HostPolicyModal
          isOpen={showPolicyModal}
          onClose={() => setShowPolicyModal(false)}
          onOpenTaskCenter={onOpenTaskCenter}
        />
      </div>
    </div>
  );
};
