import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DailyTask } from '../types';
import {
  X,
  CheckSquare,
  Coins,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Crown,
  FileText,
  Sparkles,
  ChevronRight,
  Calendar,
  Flame,
  Clock,
  Gift,
  Check,
} from 'lucide-react';
import { HostPolicyModal } from './HostPolicyModal';

export const CHECK_IN_DAYS = [
  { day: 1, reward: 50, label: 'Day 1', icon: '🪙', bonus: null },
  { day: 2, reward: 100, label: 'Day 2', icon: '🪙', bonus: null },
  { day: 3, reward: 150, label: 'Day 3', icon: '🪙', bonus: null },
  { day: 4, reward: 200, label: 'Day 4', icon: '🪙', bonus: null },
  { day: 5, reward: 300, label: 'Day 5', icon: '💎', bonus: '+Charm' },
  { day: 6, reward: 500, label: 'Day 6', icon: '🔥', bonus: 'Double' },
  { day: 7, reward: 1000, label: 'Day 7', icon: '👑', isGrand: true, bonus: 'Mega 1K' },
];

function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayDateString(): string {
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
  return `${hours}h ${mins}m`;
}

interface TaskCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHostPolicy?: () => void;
}

interface HostTaskItem {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  rateLabel: string;
  completed: boolean;
  claimed: boolean;
}

export const TaskCenterModal: React.FC<TaskCenterModalProps> = ({
  isOpen,
  onClose,
  onOpenHostPolicy,
}) => {
  const { user, adjustCoins } = useAuth();
  const [activeTab, setActiveTab] = useState<'user' | 'host'>('user');
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [weeklyTasks, setWeeklyTasks] = useState<DailyTask[]>([]);
  const [hostTasks, setHostTasks] = useState<HostTaskItem[]>([
    {
      id: 'host_new_reward',
      title: 'New Host Reward',
      description: 'First 7 days active streaming reward (up to 560,000 Points / $5.6).',
      rewardPoints: 80000,
      rateLabel: '80,000 Pts/H',
      completed: true,
      claimed: false,
    },
    {
      id: 'host_level_reward',
      title: 'Host Level Reward',
      description: '6,000 Pts/H minimum guarantee up to 2,000,000 Pts/H based on 7-day tier.',
      rewardPoints: 12000,
      rateLabel: '12,000 Pts/H (Level K)',
      completed: true,
      claimed: false,
    },
    {
      id: 'host_crown_mic',
      title: 'Crown Mic Reward',
      description: 'Active broadcast on a Crown Mic seat in live voice room.',
      rewardPoints: 3000,
      rateLabel: '3,000 Pts/Day',
      completed: true,
      claimed: false,
    },
    {
      id: 'host_tcoin_gift',
      title: 'Receive Tcoin Gift',
      description: 'Receive qualifying Tcoin gifts during live broadcast.',
      rewardPoints: 1000,
      rateLabel: '1,000 Pts/Day',
      completed: false,
      claimed: false,
    },
    {
      id: 'host_gain_followers',
      title: 'Gain Followers',
      description: 'Gain new fans and followers in your live room today.',
      rewardPoints: 1000,
      rateLabel: '1,000 Pts/Day',
      completed: true,
      claimed: false,
    },
    {
      id: 'host_room_owner',
      title: 'Crown Room Owner Reward',
      description: 'Valid Crown Mic Hours × Hourly Reward. Up to 4 seats / 96 hours daily.',
      rewardPoints: 40000,
      rateLabel: 'Up to 3,840,000 Pts/Day',
      completed: false,
      claimed: false,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [claimToast, setClaimToast] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Daily Check-in system state with localStorage persistence
  const [checkInStreak, setCheckInStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('odoo_daily_checkin');
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.streak === 'number' ? parsed.streak : 0;
      }
    } catch {}
    return 0;
  });

  const [lastCheckInDate, setLastCheckInDate] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('odoo_daily_checkin');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.lastCheckInDate || null;
      }
    } catch {}
    return null;
  });

  const [claimingCheckIn, setClaimingCheckIn] = useState<boolean>(false);
  const [resetCountdown, setResetCountdown] = useState<string>(getTimeUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => {
      setResetCountdown(getTimeUntilMidnight());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const todayDateStr = getLocalDateString();
  const yesterdayDateStr = getYesterdayDateString();
  const isClaimedToday = lastCheckInDate === todayDateStr;

  // Compute active check-in day:
  // If claimed today: the day claimed is (checkInStreak > 0 ? ((checkInStreak - 1) % 7) + 1 : 1)
  // If not claimed:
  // - if yesterday was claimed: streak continues -> (checkInStreak % 7) + 1
  // - else (first time or missed day): streak resets to 1
  const currentClaimDay = useMemo(() => {
    if (isClaimedToday) {
      return checkInStreak > 0 ? ((checkInStreak - 1) % 7) + 1 : 1;
    }
    if (lastCheckInDate === yesterdayDateStr) {
      return (checkInStreak % 7) + 1;
    }
    return 1;
  }, [isClaimedToday, checkInStreak, lastCheckInDate, yesterdayDateStr]);

  const todayReward = CHECK_IN_DAYS[currentClaimDay - 1]?.reward || 50;

  const fetchTasks = async () => {
    setLoading(true);
    setClaimError(null);
    try {
      const data = await api.tasks.getTasks();
      if (data?.dailyTasks) {
        setDailyTasks(data.dailyTasks);
      }
      if (data?.weeklyTasks) {
        setWeeklyTasks(data.weeklyTasks);
      }
    } catch (err: any) {
      setDailyTasks([
        {
          id: 'task_daily_login',
          title: 'Daily Login',
          description: 'Open OdooParty today.',
          reward: 50,
          type: 'daily',
          requirementTarget: 1,
          progress: 1,
          completed: true,
          claimed: false,
        },
        {
          id: 'task_send_gift',
          title: 'Send a Gift',
          description: 'Send one gift in a live room.',
          reward: 100,
          type: 'daily',
          requirementTarget: 1,
          progress: 0,
          completed: false,
          claimed: false,
        },
      ]);
      setWeeklyTasks([
        {
          id: 'task_join_rooms',
          title: 'Join Live Rooms',
          description: 'Join five live rooms this week.',
          reward: 500,
          type: 'weekly',
          requirementTarget: 5,
          progress: 2,
          completed: false,
          claimed: false,
        },
      ]);
    } finally {
      setLoading(false);
    }

    // Also sync check-in status from backend
    try {
      const status = await api.tasks.getCheckInStatus();
      if (status) {
        if (status.lastCheckInDate) {
          setLastCheckInDate(status.lastCheckInDate);
        }
        if (typeof status.streak === 'number') {
          setCheckInStreak(status.streak);
        }
      }
    } catch {
      // Local storage fallback is primary and instant
    }
  };

  const handleClaimDailyCheckIn = async () => {
    if (isClaimedToday || claimingCheckIn) return;

    setClaimingCheckIn(true);
    setClaimToast(null);
    setClaimError(null);

    try {
      const dayToClaim = currentClaimDay;
      const reward = CHECK_IN_DAYS[dayToClaim - 1]?.reward || 50;
      const newStreak = lastCheckInDate === yesterdayDateStr ? checkInStreak + 1 : 1;

      // Update state and localStorage
      setCheckInStreak(newStreak);
      setLastCheckInDate(todayDateStr);
      try {
        localStorage.setItem(
          'odoo_daily_checkin',
          JSON.stringify({
            streak: newStreak,
            lastCheckInDate: todayDateStr,
          })
        );
      } catch {}

      // Add coins to user immediately in AuthContext
      adjustCoins(reward);

      // Auto-mark Daily Login quest in daily tasks if present
      setDailyTasks((prev) =>
        prev.map((t) =>
          t.id === 'task_daily_login' || t.title.toLowerCase().includes('daily login')
            ? { ...t, claimed: true, completed: true }
            : t
        )
      );

      // Backend sync
      try {
        await api.tasks.claimCheckIn(dayToClaim);
      } catch {
        // Non-blocking
      }

      setClaimToast(`🎉 Day ${dayToClaim} Check-in Claimed! +${reward.toLocaleString()} Coins added to your wallet!`);
    } catch (err: any) {
      setClaimError(err.message || 'Failed to claim daily check-in.');
    } finally {
      setClaimingCheckIn(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaimUserTask = async (task: DailyTask) => {
    setClaimToast(null);
    setClaimError(null);

    try {
      await api.tasks.claimTask(task.id);
      adjustCoins(task.reward);
      setClaimToast(`Claimed +${task.reward} Coins!`);
      setDailyTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, claimed: true, completed: true } : t))
      );
      setWeeklyTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, claimed: true, completed: true } : t))
      );
    } catch (err: any) {
      if (task.completed || task.title === 'Daily Login') {
        adjustCoins(task.reward);
        setClaimToast(`Claimed +${task.reward} Coins!`);
        setDailyTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, claimed: true } : t))
        );
      } else {
        setClaimError(err.message || 'Task requirement not completed yet.');
      }
    }
  };

  const handleClaimHostTask = (task: HostTaskItem) => {
    setClaimToast(null);
    setClaimError(null);

    if (!task.completed) {
      setClaimError('Host task criteria not yet met today. Broadcast on Crown Mic to complete.');
      return;
    }

    setHostTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, claimed: true } : t))
    );
    setClaimToast(`Claimed Host Reward: +${task.rewardPoints.toLocaleString()} Points!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-5 w-full max-w-md shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300">
              <CheckSquare className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Task Center</h2>
              <span className="text-[11px] text-slate-400">Claim Coins & Host Policy Points</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPolicyModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-[10px] font-bold"
              title="Official Host Policy"
            >
              <FileText className="w-3 h-3 text-amber-400" />
              <span>Policy</span>
            </button>
            <button
              onClick={fetchTasks}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              title="Refresh Tasks"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs: User Quests vs Host Tasks (Policy) */}
        <div className="flex border-b border-slate-800 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('user')}
            className={`flex-1 pb-2 text-xs font-bold transition-colors relative ${
              activeTab === 'user' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>User Quests</span>
            {activeTab === 'user' && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('host')}
            className={`flex-1 pb-2 text-xs font-bold transition-colors relative flex items-center justify-center gap-1 ${
              activeTab === 'host' ? 'text-amber-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Host Tasks (Policy)</span>
            {activeTab === 'host' && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full" />
            )}
          </button>
        </div>

        {/* Feedback alerts */}
        {claimToast && (
          <div className="my-2 p-2 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{claimToast}</span>
          </div>
        )}

        {claimError && (
          <div className="my-2 p-2 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{claimError}</span>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3 py-2 text-xs">
          {activeTab === 'user' ? (
            <>
              {/* Daily Check-in Rewards Section */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/30 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-md">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Daily Check-in</span>
                        <span className="text-[10px] text-amber-300 font-normal">7-Day Streak</span>
                      </h3>
                      <span className="text-[10px] text-slate-400 block">Open daily to earn free coins & bonuses</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span>{checkInStreak > 0 ? `${checkInStreak}-Day Streak` : 'Day 1'}</span>
                  </div>
                </div>

                {/* 7-Day Grid */}
                <div className="grid grid-cols-7 gap-1.5 pt-1">
                  {CHECK_IN_DAYS.map((item) => {
                    const isClaimed = isClaimedToday
                      ? item.day <= currentClaimDay
                      : item.day < currentClaimDay;
                    const isCurrentActive = item.day === currentClaimDay;

                    return (
                      <div
                        key={item.day}
                        onClick={() => {
                          if (isCurrentActive && !isClaimedToday) {
                            handleClaimDailyCheckIn();
                          }
                        }}
                        className={`relative flex flex-col items-center justify-between p-1.5 rounded-xl border text-center transition-all ${
                          isCurrentActive && !isClaimedToday
                            ? 'bg-gradient-to-b from-amber-500/25 to-purple-900/30 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.04] cursor-pointer'
                            : isClaimed
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : item.isGrand
                            ? 'bg-purple-950/40 border-amber-500/40 text-amber-200'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                        }`}
                      >
                        {/* Day label */}
                        <span className="text-[9px] font-bold text-slate-300 block">
                          D{item.day}
                        </span>

                        {/* Icon or Checkmark */}
                        <div className="my-1 flex items-center justify-center">
                          {isClaimed ? (
                            <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <span className={`text-sm leading-none ${isCurrentActive && !isClaimedToday ? 'animate-bounce' : ''}`}>
                              {item.icon}
                            </span>
                          )}
                        </div>

                        {/* Reward coins */}
                        <div className="flex items-center gap-0.5 text-[9px] font-black text-amber-300">
                          <span>+{item.reward >= 1000 ? '1K' : item.reward}</span>
                        </div>

                        {/* Grand bonus tag for Day 7 */}
                        {item.isGrand && (
                          <span className="text-[7px] font-black text-amber-400 uppercase tracking-tighter">
                            Grand
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Claim Button / Status */}
                {!isClaimedToday ? (
                  <button
                    onClick={handleClaimDailyCheckIn}
                    disabled={claimingCheckIn}
                    className="w-full mt-2.5 py-2 px-3 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>Claim Day {currentClaimDay} Check-in (+{todayReward} Coins)</span>
                    <Coins className="w-3.5 h-3.5 text-slate-950" />
                  </button>
                ) : (
                  <div className="w-full mt-2.5 py-1.5 px-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Day {currentClaimDay} Claimed Today!</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span>Resets in {resetCountdown}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Daily Tasks */}
              <div>
                <span className="text-xs font-bold text-white block mb-2">Daily Tasks (Reset at 00:00)</span>
                <div className="space-y-2">
                  {dailyTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{t.title}</span>
                        <span className="text-[11px] text-slate-400 block">{t.description}</span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 mt-1">
                          <Coins className="w-3 h-3 text-amber-400" />
                          <span>+{t.reward} Coins</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleClaimUserTask(t)}
                        disabled={t.claimed}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          t.claimed
                            ? 'bg-slate-800 text-slate-500 border border-slate-700'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-md'
                        }`}
                      >
                        {t.claimed ? 'Claimed' : 'Claim'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Tasks */}
              <div>
                <span className="text-xs font-bold text-white block mb-2">Weekly Quests</span>
                <div className="space-y-2">
                  {weeklyTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{t.title}</span>
                        <span className="text-[11px] text-slate-400 block">{t.description}</span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 mt-1">
                          <Coins className="w-3 h-3 text-amber-400" />
                          <span>+{t.reward} Coins</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleClaimUserTask(t)}
                        disabled={t.claimed}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          t.claimed
                            ? 'bg-slate-800 text-slate-500 border border-slate-700'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-md'
                        }`}
                      >
                        {t.claimed ? 'Claimed' : 'Claim'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Host Tasks (From Official Host Policy Section 3) */
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-amber-300 block">Host Policy Daily Tasks</span>
                  <span className="text-[10px] text-slate-300">Section 3: Guaranteed hourly and daily host claims</span>
                </div>
                <button
                  onClick={() => setShowPolicyModal(true)}
                  className="px-2.5 py-1 rounded-xl bg-purple-600 text-white font-black text-[10px] hover:bg-purple-500 transition-colors"
                >
                  View Policy
                </button>
              </div>

              <div className="space-y-2">
                {hostTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{task.title}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-900/60 text-purple-300 border border-purple-500/30">
                          {task.rateLabel}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{task.description}</span>
                    </div>

                    <button
                      onClick={() => handleClaimHostTask(task)}
                      disabled={task.claimed}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        task.claimed
                          ? 'bg-slate-800 text-slate-500 border border-slate-700'
                          : task.completed
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:from-amber-400 hover:to-yellow-300 shadow-md font-black'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      {task.claimed ? 'Claimed' : task.completed ? 'Claim' : 'Go Live'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Host Policy Modal */}
        <HostPolicyModal
          isOpen={showPolicyModal}
          onClose={() => setShowPolicyModal(false)}
        />
      </div>
    </div>
  );
};
