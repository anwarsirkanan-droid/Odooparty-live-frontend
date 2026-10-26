import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  X,
  Coins,
  Sparkles,
  Flame,
  Check,
  Clock,
  Crown,
  Gift,
  Award,
  ChevronRight,
} from 'lucide-react';

export interface CheckInDayReward {
  day: number;
  coins: number;
  exp: number;
  label: string;
  badge?: string;
  isGrand?: boolean;
}

export const CHECK_IN_SCHEDULE: CheckInDayReward[] = [
  { day: 1, coins: 50, exp: 20, label: 'Day 1' },
  { day: 2, coins: 100, exp: 35, label: 'Day 2' },
  { day: 3, coins: 150, exp: 50, label: 'Day 3' },
  { day: 4, coins: 200, exp: 70, label: 'Day 4' },
  { day: 5, coins: 300, exp: 100, label: 'Day 5', badge: 'Bonus' },
  { day: 6, coins: 500, exp: 150, label: 'Day 6', badge: 'Double' },
  { day: 7, coins: 1000, exp: 300, label: 'Day 7', badge: 'Grand VIP', isGrand: true },
];

function getLocalDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayDateStr(): string {
  const d = new Date(Date.now() - 86400000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, adjustCoins } = useAuth();

  const [lastCheckInDate, setLastCheckInDate] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('odoo_daily_checkin');
      if (saved) {
        return JSON.parse(saved).lastCheckInDate || null;
      }
    } catch {}
    return null;
  });

  const [streak, setStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('odoo_daily_checkin');
      if (saved) {
        return JSON.parse(saved).streak || 0;
      }
    } catch {}
    return 0;
  });

  const [isClaiming, setIsClaiming] = useState(false);
  const [celebrationReward, setCelebrationReward] = useState<CheckInDayReward | null>(null);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());

  // Countdown timer to midnight
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch / Sync with backend on open
  useEffect(() => {
    if (!isOpen) return;

    api.tasks.getCheckInStatus()
      .then((status) => {
        if (status) {
          if (status.lastCheckInDate) {
            setLastCheckInDate(status.lastCheckInDate);
          }
          if (typeof status.streak === 'number') {
            setStreak(status.streak);
          }
        }
      })
      .catch(() => {
        // LocalStorage fallback is primary
      });
  }, [isOpen]);

  const todayStr = getLocalDateStr();
  const yesterdayStr = getYesterdayDateStr();
  const isAlreadyClaimedToday = lastCheckInDate === todayStr;

  // Calculate current claim day (1 to 7)
  const currentClaimDay = useMemo(() => {
    if (isAlreadyClaimedToday) {
      return streak > 0 ? ((streak - 1) % 7) + 1 : 1;
    }
    if (lastCheckInDate === yesterdayStr) {
      return (streak % 7) + 1;
    }
    return 1;
  }, [isAlreadyClaimedToday, streak, lastCheckInDate, yesterdayStr]);

  const activeReward = CHECK_IN_SCHEDULE[currentClaimDay - 1];

  const handleClaim = async () => {
    if (isAlreadyClaimedToday || isClaiming) return;

    setIsClaiming(true);
    const dayToClaim = currentClaimDay;
    const reward = CHECK_IN_SCHEDULE[dayToClaim - 1];
    const newStreak = lastCheckInDate === yesterdayStr ? streak + 1 : 1;

    try {
      // 1. Instant optimistic update
      setStreak(newStreak);
      setLastCheckInDate(todayStr);

      try {
        localStorage.setItem(
          'odoo_daily_checkin',
          JSON.stringify({
            streak: newStreak,
            lastCheckInDate: todayStr,
          })
        );
      } catch {}

      // 2. Adjust coins in AuthContext
      adjustCoins(reward.coins);

      // 3. Show celebration animation
      setCelebrationReward(reward);

      // 4. Remote API sync
      try {
        await api.tasks.claimCheckIn(dayToClaim);
      } catch {
        // ignore background error
      }
    } finally {
      setIsClaiming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-purple-500/30 rounded-3xl p-5 w-full max-w-sm shadow-2xl relative flex flex-col overflow-hidden">
        {/* Decorative Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-amber-500/30 via-purple-600/20 to-transparent blur-2xl pointer-events-none" />

        {/* Header with Close */}
        <div className="flex items-center justify-between pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-wide">Daily Check-in</h2>
              <p className="text-[11px] text-amber-300 font-medium">Claim free coins & EXP every day</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Streak & Timer Banner */}
        <div className="my-2.5 p-3 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-amber-950/50 border border-amber-500/20 flex items-center justify-between relative z-10 shadow-inner">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">
                  {streak > 0 ? `${streak}-Day Streak` : 'Start Your Streak'}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                  {streak >= 7 ? 'Max Multiplier' : `Day ${currentClaimDay}/7`}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                {isAlreadyClaimedToday ? 'Streak secured for today!' : 'Check in now to keep your streak!'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] text-slate-400 flex items-center gap-1 justify-end font-medium">
              <Clock className="w-2.5 h-2.5 text-purple-400" />
              Reset in
            </span>
            <span className="text-[11px] font-mono font-bold text-amber-300">
              {countdown}
            </span>
          </div>
        </div>

        {/* Celebration Banner when claimed */}
        {celebrationReward && (
          <div className="my-2 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-purple-600/20 border border-amber-400/50 text-center animate-fade-in relative z-10">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 font-black text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Claimed +{celebrationReward.coins.toLocaleString()} Coins!</span>
            </div>
            <p className="text-[10px] text-emerald-300 mt-0.5">
              +{celebrationReward.exp} EXP earned towards your Level!
            </p>
          </div>
        )}

        {/* 7-Day Rewards Grid */}
        <div className="grid grid-cols-4 gap-2 my-2 relative z-10">
          {CHECK_IN_SCHEDULE.slice(0, 4).map((item) => {
            const isClaimed = isAlreadyClaimedToday
              ? item.day <= currentClaimDay
              : item.day < currentClaimDay;
            const isToday = item.day === currentClaimDay;

            return (
              <div
                key={item.day}
                onClick={() => {
                  if (isToday && !isAlreadyClaimedToday) {
                    handleClaim();
                  }
                }}
                className={`relative flex flex-col items-center justify-between p-2 rounded-2xl border text-center transition-all ${
                  isToday && !isAlreadyClaimedToday
                    ? 'bg-gradient-to-b from-amber-500/25 via-purple-900/30 to-slate-900 border-amber-400 shadow-lg shadow-amber-500/25 scale-105 cursor-pointer ring-2 ring-amber-400/40'
                    : isClaimed
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                }`}
              >
                {/* Day label */}
                <span className="text-[10px] font-bold text-slate-300">{item.label}</span>

                {/* Coin Icon or Checkmark */}
                <div className="my-1.5 flex items-center justify-center">
                  {isClaimed ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="relative">
                      <span className="text-lg leading-none">🪙</span>
                      {isToday && (
                        <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1 animate-spin" />
                      )}
                    </div>
                  )}
                </div>

                {/* Reward Value */}
                <div className="flex flex-col items-center">
                  <span className={`text-[11px] font-black ${isToday ? 'text-amber-300 font-extrabold' : 'text-slate-200'}`}>
                    +{item.coins}
                  </span>
                  <span className="text-[8px] text-purple-300 font-semibold">
                    +{item.exp} EXP
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Days 5, 6, 7 (Bottom row, with Day 7 being Grand) */}
        <div className="grid grid-cols-3 gap-2 my-1 relative z-10">
          {CHECK_IN_SCHEDULE.slice(4).map((item) => {
            const isClaimed = isAlreadyClaimedToday
              ? item.day <= currentClaimDay
              : item.day < currentClaimDay;
            const isToday = item.day === currentClaimDay;

            return (
              <div
                key={item.day}
                onClick={() => {
                  if (isToday && !isAlreadyClaimedToday) {
                    handleClaim();
                  }
                }}
                className={`relative flex flex-col items-center justify-between p-2.5 rounded-2xl border text-center transition-all ${
                  item.isGrand
                    ? isToday && !isAlreadyClaimedToday
                      ? 'bg-gradient-to-b from-amber-500/30 via-yellow-500/20 to-purple-950 border-amber-300 shadow-xl shadow-amber-500/30 scale-105 cursor-pointer ring-2 ring-amber-300'
                      : isClaimed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-gradient-to-b from-purple-950/60 to-slate-900 border-amber-500/40 text-amber-200'
                    : isToday && !isAlreadyClaimedToday
                    ? 'bg-gradient-to-b from-amber-500/25 via-purple-900/30 to-slate-900 border-amber-400 shadow-lg shadow-amber-500/25 scale-105 cursor-pointer ring-2 ring-amber-400/40'
                    : isClaimed
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                }`}
              >
                {/* Badge Tag */}
                {item.badge && (
                  <span
                    className={`absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider shadow-sm ${
                      item.isGrand
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 border border-amber-200'
                        : 'bg-purple-600 text-purple-100 border border-purple-400/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                <span className="text-[10px] font-bold text-slate-300 mt-1">{item.label}</span>

                {/* Center Icon */}
                <div className="my-1 flex items-center justify-center">
                  {isClaimed ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : item.isGrand ? (
                    <span className="text-xl leading-none animate-bounce">👑</span>
                  ) : (
                    <span className="text-lg leading-none">💎</span>
                  )}
                </div>

                {/* Coins & EXP */}
                <div className="flex flex-col items-center">
                  <span className={`text-[11px] font-black ${item.isGrand ? 'text-amber-300' : isToday ? 'text-amber-300' : 'text-slate-200'}`}>
                    +{item.coins >= 1000 ? '1,000' : item.coins}
                  </span>
                  <span className="text-[8px] text-purple-300 font-semibold">
                    +{item.exp} EXP
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-3.5 relative z-10 space-y-2">
          {!isAlreadyClaimedToday ? (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="w-full py-3 px-4 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 shadow-xl shadow-amber-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-yellow-200"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>
                {isClaiming ? 'Claiming Reward...' : `Claim Day ${currentClaimDay} (+${activeReward?.coins} Coins & +${activeReward?.exp} EXP)`}
              </span>
              <Coins className="w-4 h-4 text-slate-950" />
            </button>
          ) : (
            <div className="space-y-2">
              <div className="w-full py-2.5 px-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Day {currentClaimDay} Reward Claimed!</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Come back tomorrow!
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
