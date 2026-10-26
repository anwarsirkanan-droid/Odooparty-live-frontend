import React, { useState } from 'react';
import {
  X,
  Users,
  ShieldCheck,
  TrendingUp,
  Award,
  Crown,
  ChevronRight,
  GitBranch,
  Calculator,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface AgencyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAgencyCenter?: () => void;
}

export const AGENCY_COMMISSION_TIERS = [
  { level: 'D', pointsTarget: 0, pointsLabel: '0', rate: '8%', numericRate: 0.08, color: 'from-slate-700 to-slate-800 text-slate-300' },
  { level: 'C', pointsTarget: 20000000, pointsLabel: '20M', rate: '12%', numericRate: 0.12, color: 'from-blue-600 to-cyan-500 text-white' },
  { level: 'B', pointsTarget: 100000000, pointsLabel: '100M', rate: '16%', numericRate: 0.16, color: 'from-indigo-600 to-purple-600 text-white' },
  { level: 'A', pointsTarget: 500000000, pointsLabel: '500M', rate: '18%', numericRate: 0.18, color: 'from-purple-600 to-pink-500 text-white' },
  { level: 'S', pointsTarget: 1500000000, pointsLabel: '1,500M', rate: '20%', numericRate: 0.20, color: 'from-amber-400 to-yellow-300 text-slate-950' },
  { level: 'S+', pointsTarget: -1, pointsLabel: 'Get 2 S-Level', rate: '21%', numericRate: 0.21, color: 'from-red-500 to-amber-500 text-white' },
];

export const AgencyPolicyModal: React.FC<AgencyPolicyModalProps> = ({
  isOpen,
  onClose,
  onOpenAgencyCenter,
}) => {
  const [lang, setLang] = useState<'EN' | 'OM'>('EN');
  const [activeTab, setActiveTab] = useState<'commission' | 'splus' | 'invite' | 'calculator'>('commission');

  // Interactive Calculator State
  const [myRate, setMyRate] = useState<number>(0.20); // 20%
  const [invitedRate, setInvitedRate] = useState<number>(0.18); // 18%
  const [invitedIncomeM, setInvitedIncomeM] = useState<number>(1000); // 1000M

  if (!isOpen) return null;

  // Differential formula
  const diffRate = Math.max(0, myRate - invitedRate);
  const calculatedBonusPointsM = diffRate * invitedIncomeM;
  const calculatedUsd = (calculatedBonusPointsM * 1000000) / 100000; // 100,000 pts = $1 => 1M pts = $10

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-slate-950 border border-purple-500/30 rounded-3xl w-full max-w-lg shadow-2xl relative flex flex-col h-[94vh] max-h-[850px] overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wide">
                {lang === 'EN' ? 'Agency Policy' : 'Imaammata Eejensii (Agency Policy)'}
              </h2>
              <span className="text-[10px] text-purple-300 font-semibold">Official OdooParty Live BD Program</span>
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

        {/* Quick Nav Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 text-xs shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'commission', label: lang === 'EN' ? '1. Commission Rates' : '1. Qooda Koomisheenii' },
            { id: 'splus', label: lang === 'EN' ? '21% S+ Incentive' : 'S+ 21% Badhaasa' },
            { id: 'invite', label: lang === 'EN' ? '2. Invite Bonus & Tree' : '2. Afeerraa Eejensii' },
            { id: 'calculator', label: lang === 'EN' ? 'Bonus Simulator' : 'Herrega Koomisheenii' },
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Section 1: Agent Commission From Host */}
          {(activeTab === 'commission' || activeTab === 'splus') && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-white text-sm">
                  1. {lang === 'EN' ? 'Agent Commission From Host' : 'Koomisheenii Eejensii Keessummeessaa Irraa'}
                </h3>
              </div>

              {/* Core Rules a, b, c, d */}
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-600/30 text-purple-300 font-bold text-center leading-4 shrink-0 text-[10px]">a</span>
                  <span><strong>30-Day Window:</strong> Agent commission rate is determined by agent earnings in the recent 30 days.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-600/30 text-purple-300 font-bold text-center leading-4 shrink-0 text-[10px]">b</span>
                  <span><strong>Total Earnings:</strong> Agent Earnings = Host Earnings + 【Invite Agent】 Earnings.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-600/30 text-purple-300 font-bold text-center leading-4 shrink-0 text-[10px]">c</span>
                  <span><strong>Rate Formula:</strong> Agent Earnings from Host = Host Earnings × Commission Rate.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-600/30 text-purple-300 font-bold text-center leading-4 shrink-0 text-[10px]">d</span>
                  <span><strong>Real-time Settlement:</strong> When a host receives a gift, agent commission will be credited timely.</span>
                </div>
              </div>

              {/* Commission Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-[11px] whitespace-nowrap">
                  <thead className="bg-slate-800/80 text-slate-300 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3 text-center">Level</th>
                      <th className="py-2.5 px-3">Points Target</th>
                      <th className="py-2.5 px-3 text-right">Commission Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {AGENCY_COMMISSION_TIERS.map((tier) => (
                      <tr key={tier.level} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 font-black text-xs bg-gradient-to-tr ${tier.color} shadow-sm`}>
                            {tier.level}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium">
                          {tier.level === 'S+' ? (
                            <span className="text-amber-400 font-bold">Get 2 S-Level Agency</span>
                          ) : (
                            <span>{tier.pointsTarget.toLocaleString()} Points ({tier.pointsLabel})</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-amber-400 text-xs">
                          {tier.rate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-[10px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Caution:</strong> The host income does not include any platform rewards such as ranking or tasks.
                </span>
              </div>
            </div>
          )}

          {/* S+ 21% Agency Commission Rate Section */}
          {(activeTab === 'commission' || activeTab === 'splus') && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-purple-950/40 to-slate-900 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <h3 className="font-extrabold text-white text-sm">
                    21% Agency Commission Rate (S+ Tier)
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                  Premier BD
                </span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="font-bold text-amber-300 block mb-1">Eligibility:</span>
                  <p className="text-slate-300">
                    An Agent who successfully invites <strong>2 S-Level Agencies</strong> will qualify for the <strong>21% Agency Commission Rate</strong>.
                  </p>
                </div>

                <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="font-bold text-white block mb-1">Reward Details:</span>
                  <p className="text-slate-300">
                    1. Once qualified, the Agent will continuously receive an additional <strong>1% commission</strong> based on the host revenue generated by their S-Level Agencies.
                  </p>
                  <p className="text-slate-300">
                    2. This program is a special incentive designed to reward high-performing Agents who contribute to the platform's growth.
                  </p>
                  <p className="text-slate-300">
                    3. The number of qualification slots is limited and will be granted on a first-come, first-served basis.
                  </p>
                  <p className="text-slate-300">
                    4. Eligible rewards must be claimed through the Agency Center.
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400 space-y-1">
                  <span className="font-bold text-slate-300 block">Important Notes:</span>
                  <p>• Agencies must maintain S-Level status to remain eligible for this reward.</p>
                  <p>• The platform reserves the right to review and adjust qualification requirements if necessary.</p>
                  <p>• Please refer to the latest platform announcements for any updates to the program.</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Invite Agent Bonus & Differential Tree */}
          {activeTab === 'invite' && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <GitBranch className="w-4 h-4 text-purple-400" />
                <h3 className="font-extrabold text-white text-sm">
                  2. {lang === 'EN' ? 'Invite Agent Bonus' : 'Koomisheenii Afeerraa Eejensii'}
                </h3>
              </div>

              {/* Main Formula */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/40 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-300">Invitation Differential Formula</span>
                <p className="text-xs font-black text-amber-300">
                  Invitation Bonus = (Your Commission Rate − Invited Agency Commission Rate) × Invited Agency Host Income
                </p>
                <p className="text-[10px] text-slate-300">
                  The main agency can earn commissions from the income of each tier of sub-agencies (T1, T2, T3, T4, ... Tn), with a maximum commission rate of 20%.
                </p>
              </div>

              {/* Official Example Breakdown */}
              <div className="space-y-2 text-[11px]">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Network Tree Example (A → B, C):</span>
                </h4>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] space-y-2 text-slate-300">
                  <p className="text-purple-300 font-bold">
                    • Agency A invites Agency B and Agency C<br />
                    • Agency B invites Agency D and Agency E<br />
                    • Agency C invites Agency F
                  </p>

                  <div className="border-t border-slate-800 pt-1.5 space-y-1">
                    <p>• <strong>Agency A Team Income:</strong> A + B + C = 100M + 1000M + 500M = <strong className="text-amber-400">1600M 【20% Commission】</strong></p>
                    <p>• <strong>Agency B Team Income:</strong> B + D + E = 780M + 200M + 20M = <strong className="text-purple-300">1000M 【18% Commission】</strong></p>
                    <p>• <strong>Agency C Team Income:</strong> C + F = 490M + 10M = <strong className="text-purple-300">500M 【18% Commission】</strong></p>
                    <p className="text-slate-400">• Sub-Agencies: Agency D = 200M (16%), Agency E = 20M (12%), Agency F = 10M (8%)</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-white space-y-1">
                    <span className="font-bold text-amber-300 block">Calculation for Agent A:</span>
                    <p>1. Invite Agent B Bonus = (20% − 18%) × 1000M = <strong>20M Pts = $200 USD</strong></p>
                    <p>2. Invite Agent C Bonus = (20% − 18%) × 500M = <strong>10M Pts = $100 USD</strong></p>
                    <div className="pt-1 border-t border-purple-500/20 text-xs font-black text-emerald-400 flex justify-between">
                      <span>Total Agency Invitation Bonus:</span>
                      <span>200 + 100 = $300 USD (30M Points)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bonus Simulator / Calculator */}
          {activeTab === 'calculator' && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                <h3 className="font-extrabold text-white text-sm">
                  Interactive Differential Bonus Calculator
                </h3>
              </div>

              <div className="space-y-3">
                {/* Your Rate Selector */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Your Agency Rate: <span className="text-amber-400 font-extrabold">{(myRate * 100).toFixed(0)}%</span>
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {[0.08, 0.12, 0.16, 0.18, 0.20, 0.21].map((r) => (
                      <button
                        key={r}
                        onClick={() => setMyRate(r)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          myRate === r
                            ? 'bg-amber-400 text-slate-950 shadow'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {(r * 100).toFixed(0)}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Invited Agency Rate Selector */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Invited Sub-Agency Rate: <span className="text-purple-300 font-extrabold">{(invitedRate * 100).toFixed(0)}%</span>
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {[0.08, 0.12, 0.16, 0.18, 0.20].map((r) => (
                      <button
                        key={r}
                        onClick={() => setInvitedRate(r)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          invitedRate === r
                            ? 'bg-purple-600 text-white shadow'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {(r * 100).toFixed(0)}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-Agency Team Income */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Invited Agency Team Income (in Millions of Points):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={invitedIncomeM}
                      onChange={(e) => setInvitedIncomeM(Math.max(0, Number(e.target.value) || 0))}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-slate-400 font-bold text-xs">Million Pts</span>
                  </div>
                </div>

                {/* Calculation Output Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-purple-950/40 border border-emerald-500/40 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Differential Profit Result</span>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-white">
                        {calculatedBonusPointsM.toFixed(1)}M
                      </span>
                      <span className="text-xs text-slate-400 ml-1">Points</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-400">
                        ${calculatedUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">USD</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800">
                    Formula: ({(myRate * 100).toFixed(0)}% − {(invitedRate * 100).toFixed(0)}%) × {invitedIncomeM}M = {calculatedBonusPointsM.toFixed(1)}M Points
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
          <span className="text-[10px] text-slate-500">
            {lang === 'EN' ? 'Official Agency Policy • OdooParty Live' : 'Imaammata Eejensii • OdooParty Live'}
          </span>
          <div className="flex items-center gap-2">
            {onOpenAgencyCenter && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAgencyCenter();
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
              >
                {lang === 'EN' ? 'Agency Center' : 'Gara Eejensii'}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              {lang === 'EN' ? 'Close' : 'Cufi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
