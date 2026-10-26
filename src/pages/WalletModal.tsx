import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { WITHDRAWAL_MIN_USD, POINTS_PER_USD } from '../utils/constants';
import { WithdrawalRequest } from '../types';
import {
  X,
  Coins,
  Diamond,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'balance' | 'recharge' | 'withdraw';
  onOpenCoinSeller: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'balance',
  onOpenCoinSeller,
}) => {
  const { user, adjustPoints, adjustDiamonds, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'balance' | 'recharge' | 'withdraw' | 'history'>(defaultTab);

  // Recharge state
  const [rechargeAmount, setRechargeAmount] = useState<number>(10);
  const [rechargeStatus, setRechargeStatus] = useState<string | null>(null);
  const [rechargeError, setRechargeError] = useState<string | null>(null);
  const [isRecharging, setIsRecharging] = useState(false);

  // Withdrawal state
  const [withdrawPoints, setWithdrawPoints] = useState<number>(1000000); // 1,000,000 pts = $10
  const [paymentMethod, setPaymentMethod] = useState<'CBE' | 'Telebirr' | 'Crypto' | 'Bank Transfer'>('Telebirr');
  const [accountDetails, setAccountDetails] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // History state
  const [requests, setRequests] = useState<WithdrawalRequest[]>([
    {
      id: 'wd_1',
      pointsAmount: 2000000,
      usdAmount: 20,
      feeUsd: 0.5,
      netUsd: 19.5,
      paymentMethod: 'Telebirr',
      accountDetails: '+251 91 123 4567',
      status: 'Paid',
      createdAt: '2026-10-20',
    },
  ]);

  if (!isOpen) return null;

  const currentCoins = user?.coins || 0;
  const currentPoints = user?.points || 0;
  const currentDiamonds = user?.diamonds || 0;
  const totalRechargeCoins = user?.totalRechargedCoins || 0;

  // Withdrawal calculations
  const usdEquivalent = withdrawPoints / POINTS_PER_USD;
  const fee = Math.round(usdEquivalent * 0.02 * 100) / 100; // estimated 2% platform processing fee
  const netUsd = Math.max(0, usdEquivalent - fee);

  const handleRechargeAttempt = async () => {
    setIsRecharging(true);
    setRechargeError(null);
    setRechargeStatus(null);

    try {
      // Direct call to authoritative backend route
      await api.wallet.recharge(rechargeAmount);
      setRechargeStatus('Payment gateway opened.');
      await refreshUser();
    } catch (err: any) {
      // Backend policy returns 501: "Coin recharge is unavailable until a payment provider can verify the transaction."
      // As instructed in rules: display honest authoritative backend message and recommend verified Coin Sellers!
      setRechargeError(err.message || 'Direct automated payment gateway is pending gateway activation. Please purchase coins via verified Coin Sellers.');
    } finally {
      setIsRecharging(false);
    }
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(null);

    if (usdEquivalent < WITHDRAWAL_MIN_USD) {
      setWithdrawError(`Minimum withdrawal amount is $${WITHDRAWAL_MIN_USD} (${(WITHDRAWAL_MIN_USD * POINTS_PER_USD).toLocaleString()} Points).`);
      return;
    }

    if (currentPoints < withdrawPoints) {
      setWithdrawError(`Insufficient Points balance. You have ${currentPoints.toLocaleString()} Points.`);
      return;
    }

    if (!accountDetails.trim()) {
      setWithdrawError('Please enter your account number or phone number for payout.');
      return;
    }

    setIsWithdrawing(true);
    setTimeout(() => {
      adjustPoints(-withdrawPoints);
      const newReq: WithdrawalRequest = {
        id: 'wd_' + Date.now(),
        pointsAmount: withdrawPoints,
        usdAmount: usdEquivalent,
        feeUsd: fee,
        netUsd: netUsd,
        paymentMethod,
        accountDetails,
        status: 'Pending',
        createdAt: new Date().toLocaleDateString(),
      };
      setRequests((prev) => [newReq, ...prev]);
      setWithdrawSuccess(`Withdrawal of $${usdEquivalent.toFixed(2)} (${withdrawPoints.toLocaleString()} Points) submitted! Status: Pending review.`);
      setIsWithdrawing(false);
      setAccountDetails('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-5 w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">OdooParty Multi-Wallet</h2>
              <span className="text-[11px] text-slate-400">Coins • Points • Diamonds</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl my-3 shrink-0">
          {(['balance', 'recharge', 'withdraw', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3">
          {/* 1. BALANCE TAB */}
          {activeTab === 'balance' && (
            <div className="space-y-3">
              {/* Coins Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/40 relative overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>Coins Balance</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-medium">
                    Gifts & Games
                  </span>
                </div>
                <div className="text-2xl font-black text-amber-300 tracking-tight">
                  {currentCoins.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Used for sending Lucky & Luxury gifts, voice room perks, and game spins.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setActiveTab('recharge')}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold py-1.5 rounded-xl shadow-md flex items-center justify-center gap-1 transition-transform active:scale-95"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Recharge</span>
                  </button>
                  <button
                    onClick={onOpenCoinSeller}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs font-bold py-1.5 rounded-xl flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Coin Sellers</span>
                  </button>
                </div>
              </div>

              {/* Points Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/40">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Host & Task Points</span>
                  </div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-medium">
                    100,000 Pts = $1
                  </span>
                </div>
                <div className="text-2xl font-black text-purple-300 tracking-tight">
                  {currentPoints.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Earned via Crown Mic hours, host level rewards, and daily tasks. Convert to USD.
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => setActiveTab('withdraw')}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-1.5 rounded-xl shadow-md flex items-center justify-center gap-1 transition-transform active:scale-95"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Withdraw (${(currentPoints / POINTS_PER_USD).toFixed(2)})</span>
                  </button>
                </div>
              </div>

              {/* Diamonds Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/40">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                    <Diamond className="w-4 h-4 text-cyan-400" />
                    <span>Diamonds</span>
                  </div>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 font-medium">
                    Host Live Earnings
                  </span>
                </div>
                <div className="text-2xl font-black text-cyan-300 tracking-tight">
                  {currentDiamonds.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Accumulated from gifts received while on host mic. Subject to authoritative backend policy.
                </p>
              </div>

              {/* Cumulative Wealth Value Info */}
              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block">Cumulative Recharged Coins (Wealth Value)</span>
                  <span className="font-bold text-white">{totalRechargeCoins.toLocaleString()} Coins</span>
                </div>
                <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                  Gifts & Games excluded
                </span>
              </div>
            </div>
          )}

          {/* 2. RECHARGE TAB */}
          {activeTab === 'recharge' && (
            <div className="space-y-3">
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700">
                <span className="text-xs font-bold text-slate-200 block mb-1">Direct Platform Recharge</span>
                <p className="text-[11px] text-slate-400">
                  Select an amount to test gateway initialization. As per confirmed rules, regular users receive backend-verified rates.
                </p>

                <div className="grid grid-cols-3 gap-2 my-3">
                  {[10, 25, 50, 100, 200, 1000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setRechargeAmount(amt)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        rechargeAmount === amt
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-xs">${amt}</div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleRechargeAttempt}
                  disabled={isRecharging}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isRecharging ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Proceed with ${rechargeAmount}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status / Authoritative Backend Feedback */}
              {rechargeError && (
                <div className="bg-amber-950/70 border border-amber-500/50 p-3 rounded-2xl text-xs text-amber-200">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Authoritative Notice:</span>
                      <p className="text-[11px] text-amber-100/90">{rechargeError}</p>
                    </div>
                  </div>
                  <button
                    onClick={onOpenCoinSeller}
                    className="w-full bg-amber-500 text-slate-950 font-bold py-1.5 rounded-xl text-[11px] flex items-center justify-center gap-1"
                  >
                    <span>Contact Approved Coin Seller Tiers</span>
                  </button>
                </div>
              )}

              {/* Verified Seller Channel Callout */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/30">
                <span className="text-xs font-bold text-purple-300 block mb-1">
                  Verified Coin Sellers Pricing:
                </span>
                <div className="text-[11px] text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Beginner Seller:</span>
                    <span className="font-bold text-amber-300">$1 = 96,000 Coins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Standard Seller:</span>
                    <span className="font-bold text-amber-300">$1 = 98,000 Coins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Senior Seller:</span>
                    <span className="font-bold text-amber-300">$1 = 100,000 Coins</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. WITHDRAW TAB */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdrawalSubmit} className="space-y-3">
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Available Points:</span>
                  <span className="font-bold text-purple-300">{currentPoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Conversion Policy:</span>
                  <span className="font-bold text-emerald-400">100,000 Points = $1</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-slate-400">Minimum Withdrawal:</span>
                  <span className="font-bold text-amber-400">${WITHDRAWAL_MIN_USD}</span>
                </div>
              </div>

              {withdrawError && (
                <div className="flex items-center gap-2 bg-red-950/60 border border-red-500/40 p-2.5 rounded-xl text-red-200 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{withdrawError}</span>
                </div>
              )}

              {withdrawSuccess && (
                <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 p-2.5 rounded-xl text-emerald-200 text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{withdrawSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Points to Withdraw:
                </label>
                <input
                  type="number"
                  min={WITHDRAWAL_MIN_USD * POINTS_PER_USD}
                  step={100000}
                  value={withdrawPoints}
                  onChange={(e) => setWithdrawPoints(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Conversion Preview */}
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Gross USD:</span>
                  <span className="font-bold text-white">${usdEquivalent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Estimated Processing Fee (2%):</span>
                  <span>${fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-purple-900/30">
                  <span>Net Estimated Payout:</span>
                  <span>${netUsd.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Payout Method:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Telebirr', 'CBE', 'Crypto', 'Bank Transfer'] as const).map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                        paymentMethod === method
                          ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Account Number / Phone / Wallet:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +251 9... or Account #"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isWithdrawing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 shadow-lg shadow-purple-600/30"
              >
                {isWithdrawing ? 'Submitting...' : `Submit Withdrawal Request ($${netUsd.toFixed(2)})`}
              </button>
            </form>
          )}

          {/* 4. HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block mb-2">Withdrawal & Transaction History</span>
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>${req.usdAmount.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({req.pointsAmount.toLocaleString()} Pts)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {req.paymentMethod} • {req.accountDetails}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{req.createdAt}</div>
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        req.status === 'Paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : req.status === 'Approved'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : req.status === 'Rejected'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{req.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
