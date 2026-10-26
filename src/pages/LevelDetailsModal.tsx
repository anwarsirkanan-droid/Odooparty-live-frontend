import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CONFIRMED_WEALTH_THRESHOLDS, CONFIRMED_CHARM_THRESHOLDS, getMedalCategory } from '../utils/constants';
import { X, Sparkles, Shield, HeartHandshake, Info } from 'lucide-react';

interface LevelDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'wealth' | 'charm';
}

export const LevelDetailsModal: React.FC<LevelDetailsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'wealth',
}) => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'wealth' | 'charm'>(defaultTab);

  if (!isOpen) return null;

  const currentWealthCoins = user?.totalRechargedCoins || 0;
  const currentCharmPts = user?.charmPoints || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-5 w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Honor & Level Details</h2>
              <span className="text-[11px] text-slate-400">Wealth Level & Charm Level</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl my-3 shrink-0">
          <button
            onClick={() => setTab('wealth')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
              tab === 'wealth'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wealth Level (Recharge Only)
          </button>
          <button
            onClick={() => setTab('charm')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
              tab === 'charm'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Charm Level (Gifts Received)
          </button>
        </div>

        {/* Tab content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3">
          {/* WEALTH TAB */}
          {tab === 'wealth' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-500/40">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-amber-300">Your Current Wealth:</span>
                  <span className="text-xs font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                    Level {user?.wealthLevel?.level || 1} • {getMedalCategory(user?.wealthLevel?.level || 1)}
                  </span>
                </div>
                <div className="text-xl font-black text-white">
                  {currentWealthCoins.toLocaleString()} Recharged Coins
                </div>
                <div className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-200/80">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Rule: Only successful coin recharges count toward Wealth Level. Gift and game earnings are strictly excluded.</span>
                </div>
              </div>

              {/* Thresholds Table */}
              <div className="rounded-2xl border border-slate-800 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-800 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Level</th>
                      <th className="py-2.5 px-3">Recharge Threshold</th>
                      <th className="py-2.5 px-3 text-right">Medal Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {CONFIRMED_WEALTH_THRESHOLDS.map((w) => (
                      <tr key={w.level} className="hover:bg-purple-950/30">
                        <td className="py-2.5 px-3 font-bold text-amber-300">
                          Lv.{w.level} ({w.title})
                        </td>
                        <td className="py-2.5 px-3 text-slate-200 text-[11px]">
                          {w.threshold.toLocaleString()} Coins
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-300 text-[11px]">
                          {w.medal} (Lv.{w.level < 10 ? '1-9' : w.level < 20 ? '10-19' : '20-29'})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CHARM TAB */}
          {tab === 'charm' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-950/60 to-slate-900 border border-pink-500/40">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-pink-300">Your Current Charm:</span>
                  <span className="text-xs font-black bg-pink-500 text-white px-2 py-0.5 rounded-full">
                    Level {user?.charmLevel?.level || 1} • {getMedalCategory(user?.charmLevel?.level || 1)}
                  </span>
                </div>
                <div className="text-xl font-black text-white">
                  {currentCharmPts.toLocaleString()} Charm Points
                </div>
                <div className="mt-2 flex items-start gap-1.5 text-[11px] text-pink-200/80">
                  <HeartHandshake className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                  <span>Rule: Charm points are earned from gifts received in live audio rooms. Super Lucky gifts grant 4% charm, Luxury gifts grant 70% charm.</span>
                </div>
              </div>

              {/* Thresholds Table */}
              <div className="rounded-2xl border border-slate-800 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-800 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Level</th>
                      <th className="py-2.5 px-3">Charm Points Threshold</th>
                      <th className="py-2.5 px-3 text-right">Medal Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {CONFIRMED_CHARM_THRESHOLDS.map((c) => (
                      <tr key={c.level} className="hover:bg-purple-950/30">
                        <td className="py-2.5 px-3 font-bold text-pink-300">
                          Lv.{c.level} ({c.title})
                        </td>
                        <td className="py-2.5 px-3 text-slate-200 text-[11px]">
                          {c.threshold.toLocaleString()} Pts
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-300 text-[11px]">
                          {c.medal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
