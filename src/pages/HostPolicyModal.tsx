import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Award,
  Crown,
  Gift,
  Flame,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Clock,
  Radio,
  Coins,
  Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HostPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTaskCenter?: () => void;
}

export const HOST_LEVEL_TIERS = [
  { level: 'S', minPoints: 500000000, rewardPerHour: 2000000, hoursPerDay: 3, color: 'from-amber-400 to-yellow-200 text-slate-950' },
  { level: 'A', minPoints: 200000000, rewardPerHour: 1000000, hoursPerDay: 3, color: 'from-purple-500 to-pink-500 text-white' },
  { level: 'B', minPoints: 100000000, rewardPerHour: 500000, hoursPerDay: 3, color: 'from-blue-500 to-indigo-500 text-white' },
  { level: 'C', minPoints: 70000000, rewardPerHour: 350000, hoursPerDay: 3, color: 'from-cyan-500 to-blue-500 text-white' },
  { level: 'D', minPoints: 40000000, rewardPerHour: 300000, hoursPerDay: 3, color: 'from-emerald-500 to-teal-500 text-white' },
  { level: 'E', minPoints: 20000000, rewardPerHour: 150000, hoursPerDay: 3, color: 'from-teal-500 to-emerald-600 text-white' },
  { level: 'F', minPoints: 12000000, rewardPerHour: 120000, hoursPerDay: 3, color: 'from-yellow-500 to-amber-600 text-slate-950' },
  { level: 'G', minPoints: 9000000, rewardPerHour: 90000, hoursPerDay: 3, color: 'from-orange-500 to-red-500 text-white' },
  { level: 'H', minPoints: 3000000, rewardPerHour: 45000, hoursPerDay: 2, color: 'from-rose-500 to-pink-600 text-white' },
  { level: 'I', minPoints: 1500000, rewardPerHour: 30000, hoursPerDay: 2, color: 'from-indigo-600 to-purple-600 text-white' },
  { level: 'J', minPoints: 1000000, rewardPerHour: 20000, hoursPerDay: 2, color: 'from-slate-700 to-slate-800 text-white' },
  { level: 'K', minPoints: 500000, rewardPerHour: 12000, hoursPerDay: 2, color: 'from-slate-700 to-slate-800 text-amber-300' },
  { level: 'L', minPoints: 0, rewardPerHour: 6000, hoursPerDay: 1, color: 'from-slate-800 to-slate-900 text-slate-300' },
];

export const ROOM_OWNER_TIERS = [
  { level: 'A', revenueCoins: 10000000000, rewardPerHour: 40000 },
  { level: 'B', revenueCoins: 5000000000, rewardPerHour: 20000 },
  { level: 'C', revenueCoins: 2000000000, rewardPerHour: 10000 },
  { level: 'D', revenueCoins: 1000000000, rewardPerHour: 5000 },
  { level: 'E', revenueCoins: 500000000, rewardPerHour: 2500 },
  { level: 'F', revenueCoins: 100000000, rewardPerHour: 500 },
  { level: 'G', revenueCoins: 50000000, rewardPerHour: 300 },
  { level: 'H', revenueCoins: 30000000, rewardPerHour: 200 },
  { level: 'I', revenueCoins: 10000000, rewardPerHour: 100 },
];

export const HostPolicyModal: React.FC<HostPolicyModalProps> = ({
  isOpen,
  onClose,
  onOpenTaskCenter,
}) => {
  const { user } = useAuth();
  const [lang, setLang] = useState<'EN' | 'OM'>('EN');
  const [activeTab, setActiveTab] = useState<'all' | 'level' | 'tasks' | 'owner'>('all');

  if (!isOpen) return null;

  // Derive host 7-day points
  const hostPoints7D = user?.diamonds || user?.points || 0;

  // Find user's tier
  const currentTier = HOST_LEVEL_TIERS.find((t) => hostPoints7D >= t.minPoints) || HOST_LEVEL_TIERS[HOST_LEVEL_TIERS.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-slate-950 border border-purple-500/30 rounded-3xl w-full max-w-lg shadow-2xl relative flex flex-col h-[94vh] max-h-[850px] overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-purple-600 flex items-center justify-center text-slate-950 font-black shadow">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wide">
                {lang === 'EN' ? 'Host Policy' : 'Imaammata Keessummeessaa (Host)'}
              </h2>
              <span className="text-[10px] text-amber-400 font-semibold">Official OdooParty Live Rules</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800 rounded-full p-0.5 border border-slate-700">
              <button
                onClick={() => setLang('EN')}
                className={`px-2 py-0.5 text-[10px] font-black rounded-full transition-all ${
                  lang === 'EN' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('OM')}
                className={`px-2 py-0.5 text-[10px] font-black rounded-full transition-all ${
                  lang === 'OM' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                OM
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Current Host Status Strip */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">
              {lang === 'EN' ? 'Your Current Level:' : 'Sadarkaa Keessan:'}
            </span>
            <span className="px-2 py-0.5 rounded-full font-black text-[11px] bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow">
              Level {currentTier.level}
            </span>
          </div>
          <div className="text-[11px] text-right">
            <span className="text-amber-300 font-bold">{currentTier.rewardPerHour.toLocaleString()} Pts/H</span>
            <span className="text-slate-500 text-[10px] block">({currentTier.hoursPerDay}h/day max)</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 text-xs shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: lang === 'EN' ? 'Overview' : 'Waliigala' },
            { id: 'level', label: lang === 'EN' ? 'Host Level (S-L)' : 'Sadarkaa Host' },
            { id: 'tasks', label: lang === 'EN' ? 'Daily Tasks' : 'Hojii Guyyaa' },
            { id: 'owner', label: lang === 'EN' ? 'Room Owner' : 'Abbaa Kutaa' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-3 font-extrabold text-[11px] whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-300 bg-purple-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Policy Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* Section 1: Reward Types */}
          {(activeTab === 'all' || activeTab === 'tasks') && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Gift className="w-4 h-4 text-pink-400" />
                <h3 className="font-extrabold text-white text-sm">
                  1. {lang === 'EN' ? 'Reward Types' : 'Gosa Badhaasaa (Reward Types)'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'EN'
                  ? 'Hosts can earn rewards through the following official channels:'
                  : 'Keessummeessitoonni (Hosts) karaa armaan gadii badhaasa argachuu danda\'u:'}
              </p>

              <div className="overflow-hidden rounded-xl border border-slate-800">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-800/80 text-slate-300 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2 px-3">
                        {lang === 'EN' ? 'Reward Type' : 'Gosa Badhaasaa'}
                      </th>
                      <th className="py-2 px-3">
                        {lang === 'EN' ? 'Details' : 'Ibsa'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-semibold text-white">Gift Revenue Share</td>
                      <td className="py-2 px-3 text-emerald-400 font-medium">
                        Luxury Gift 70%, Lucky Gift 4%, Super Lucky Gift 2%
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-semibold text-white">New Host Reward</td>
                      <td className="py-2 px-3 text-amber-300">
                        80,000 Points/H during the first 7 days, up to 560,000 Points ($5.6)
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-semibold text-white">Host Level Reward</td>
                      <td className="py-2 px-3 text-purple-300">
                        Up to 2,000,000 Points/H based on 7-day points tier
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-semibold text-white">Daily Host Tasks</td>
                      <td className="py-2 px-3 text-slate-300">
                        Crown Mic, Tcoin Gift, Follow Reward
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-semibold text-white">Game Room Reward</td>
                      <td className="py-2 px-3 text-slate-300">
                        Crown Mic Reward and Room Owner Reward
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 2: Host Level Reward Table (S to L) */}
          {(activeTab === 'all' || activeTab === 'level') && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h3 className="font-extrabold text-white text-sm">
                    2. {lang === 'EN' ? 'Host Level Reward (S - L)' : 'Sadarkaa Badhaasa Host (S - L)'}
                  </h3>
                </div>
                <span className="text-[10px] text-amber-300 font-mono">13 Levels</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-[11px] whitespace-nowrap">
                  <thead className="bg-slate-800/80 text-slate-300 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2 px-3 text-center">Level</th>
                      <th className="py-2 px-3">Last 7 Days Points</th>
                      <th className="py-2 px-3">Reward (Points/H)</th>
                      <th className="py-2 px-3 text-center">Hours/Day</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {HOST_LEVEL_TIERS.map((tier) => {
                      const isCurrent = currentTier.level === tier.level;
                      return (
                        <tr
                          key={tier.level}
                          className={`transition-colors ${
                            isCurrent
                              ? 'bg-purple-900/40 border-l-4 border-amber-400 font-bold text-white'
                              : 'hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-2 px-3 text-center">
                            <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 font-black text-xs bg-gradient-to-tr ${tier.color} shadow-sm`}>
                              {tier.level}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono">
                            {tier.minPoints.toLocaleString()}
                            {isCurrent && (
                              <span className="ml-1.5 px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[9px]">
                                Current
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-bold text-amber-400">
                            {tier.rewardPerHour.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-purple-300">
                            {tier.hoursPerDay}h
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
                <h5 className="font-bold text-slate-200">
                  {lang === 'EN' ? 'Important Notes:' : 'Hubachiisa Murteessaa:'}
                </h5>
                <p className="leading-relaxed">
                  • <strong>Last 7 Days Points</strong> only include gift income and does not include any platform rewards such as ranking rewards, task rewards, activity rewards, or other bonus rewards.
                </p>
                <p className="leading-relaxed">
                  • Hosts can claim Host level reward for only one level per day. After upgrading to a higher level, only the difference between the new and previously claimed rewards can be claimed.
                </p>
              </div>
            </div>
          )}

          {/* Section 3: Daily Host Tasks */}
          {(activeTab === 'all' || activeTab === 'tasks') && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <h3 className="font-extrabold text-white text-sm">
                  3. {lang === 'EN' ? 'Daily Host Tasks' : 'Hojii Guyyaa Host (Daily Host Tasks)'}
                </h3>
              </div>

              <div className="space-y-2">
                {[
                  {
                    task: 'New Host Reward',
                    details: '80,000 Points/H',
                    desc: 'Available for the first 7 days, up to 560,000 Points ($5.6).',
                    badge: '80,000/H',
                    badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
                  },
                  {
                    task: 'Host Level Reward',
                    details: '6,000 - 2,000,000 Points/H',
                    desc: '6,000 Points/H minimum guarantee. Up to 2,000,000 Points/H based on host level.',
                    badge: 'Min 6k/H',
                    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                  },
                  {
                    task: 'Crown Room Owner Reward',
                    details: 'Up to 3,840,000 Points/Day',
                    desc: 'Calculated from valid Crown Mic hours and 7-day game revenue.',
                    badge: 'Max 3.84M/Day',
                    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                  },
                  {
                    task: 'Crown Mic Reward',
                    details: '3,000 Points/Day',
                    desc: 'Earned by staying on an active Crown Mic seat during live broadcast.',
                    badge: '+3,000 Pts',
                    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                  },
                  {
                    task: 'Receive Tcoin Gift',
                    details: '1,000 Points/Day',
                    desc: 'Awarded when receiving qualified Tcoin gifts from live viewers.',
                    badge: '+1,000 Pts',
                    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                  },
                  {
                    task: 'Gain Followers',
                    details: '1,000 Points/Day',
                    desc: 'Rewarded upon acquiring new fans/followers during daily streaming.',
                    badge: '+1,000 Pts',
                    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{item.task}</span>
                        <span className={`text-[10px] font-black px-2 py-0.2 rounded-full border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3.1: Room Owner Reward Table */}
          {(activeTab === 'all' || activeTab === 'owner') && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <h3 className="font-extrabold text-white text-sm">
                    3.1 {lang === 'EN' ? 'Room Owner Reward' : 'Badhaasa Abbaa Kutaa (Room Owner)'}
                  </h3>
                </div>
                <span className="text-[10px] text-amber-300 font-mono">Max 3.84M Pts/Day</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-[11px] whitespace-nowrap">
                  <thead className="bg-slate-800/80 text-slate-300 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2 px-3 text-center">Level</th>
                      <th className="py-2 px-3">7-Day Game Revenue (Coins)</th>
                      <th className="py-2 px-3">Reward (Points/H)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {ROOM_OWNER_TIERS.map((tier) => (
                      <tr key={tier.level} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 text-center font-black text-amber-400">
                          {tier.level}
                        </td>
                        <td className="py-2 px-3 font-mono">{tier.revenueCoins.toLocaleString()}</td>
                        <td className="py-2 px-3 font-bold text-purple-300">
                          {tier.rewardPerHour.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Formula & Rules */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
                <h5 className="font-bold text-slate-200">
                  {lang === 'EN' ? 'Room Owner Calculation Formula:' : 'Herrega Badhaasa Abbaa Kutaa:'}
                </h5>
                <p className="text-white font-mono bg-slate-900 p-2 rounded-lg border border-slate-800">
                  Room Owner Reward = Total Valid Crown Mic Hours × Reward (Points/H)
                </p>
                <p className="leading-relaxed">
                  • A room can activate up to <strong>4 Crown Mic Seats</strong>, with a maximum of <strong>96 Reward Hours per Day</strong>.
                </p>
                <p className="leading-relaxed">
                  • The maximum Room Owner Reward is <strong className="text-amber-400">3,840,000 Points/Day</strong> (40,000 × 96).
                </p>
              </div>
            </div>
          )}

          {/* Section 4: Reward Claim Rules */}
          {(activeTab === 'all' || activeTab === 'tasks') && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 space-y-3">
              <div className="flex items-center gap-2 border-b border-purple-500/20 pb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="font-extrabold text-white text-sm">
                  4. {lang === 'EN' ? 'Reward Claim Rules' : 'Seera Badhaasa Fudhachuu'}
                </h3>
              </div>

              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Manual Claim:</strong> All rewards must be claimed manually through the <strong>Task Center</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Expiration:</strong> Unclaimed rewards may expire according to platform rules if not collected within the designated cycle.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Adjustment Rights:</strong> Exchange rates and reward policies may be adjusted by the platform. The latest platform announcement shall prevail.
                  </span>
                </li>
              </ul>

              {onOpenTaskCenter && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenTaskCenter();
                  }}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-transform active:scale-98"
                >
                  <span>{lang === 'EN' ? 'Open Task Center to Claim' : 'Task Center Seeni Badhaasa Fudhadhu'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
          <span className="text-[10px] text-slate-500">
            {lang === 'EN' ? 'Official Host Policy • OdooParty Live' : 'Imaammata Keessummeessaa • OdooParty Live'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            {lang === 'EN' ? 'Close' : 'Cufi'}
          </button>
        </div>
      </div>
    </div>
  );
};
