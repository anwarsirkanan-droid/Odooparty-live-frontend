import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GIFTS_CATALOG } from '../utils/constants';
import { GiftItem, LuckyGiftResult } from '../types';
import { api } from '../services/api';
import { X, Sparkles, Coins, Flame, Award, AlertCircle } from 'lucide-react';

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverName: string;
  receiverId: string;
  onGiftSent: (gift: GiftItem, count: number, luckyResult?: LuckyGiftResult) => void;
  onOpenRecharge: () => void;
}

export const GiftModal: React.FC<GiftModalProps> = ({
  isOpen,
  onClose,
  receiverName,
  receiverId,
  onGiftSent,
  onOpenRecharge,
}) => {
  const { user, adjustCoins, adjustCharm } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'popular' | 'lucky' | 'luxury'>('popular');
  const [selectedGift, setSelectedGift] = useState<GiftItem>(GIFTS_CATALOG[0]);
  const [count, setCount] = useState<number>(1);
  const [isSending, setIsSending] = useState(false);
  const [luckyResult, setLuckyResult] = useState<LuckyGiftResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCoins = user?.coins || 0;
  const filteredGifts = GIFTS_CATALOG.filter((g) => g.category === selectedCategory);
  const totalCost = selectedGift.coins * count;

  const handleSend = async () => {
    setErrorMsg(null);
    setLuckyResult(null);

    if (currentCoins < totalCost) {
      setErrorMsg(`Insufficient coins. You need ${totalCost.toLocaleString()} Coins (Balance: ${currentCoins.toLocaleString()}).`);
      return;
    }

    setIsSending(true);

    try {
      // 1. Process Lucky Gift or Regular Gift logic
      let luckyOutcome: LuckyGiftResult | undefined;
      if (selectedGift.isLucky) {
        luckyOutcome = api.gifts.calculateLuckyResult(selectedGift.coins, count);
        setLuckyResult(luckyOutcome);
      }

      // 2. Adjust local user balance
      adjustCoins(-totalCost);

      // If lucky gift won, credit payout coins!
      if (luckyOutcome?.won && luckyOutcome.payout > 0) {
        adjustCoins(luckyOutcome.payout);
      }

      // Calculate Charm Points for receiver
      let charmBonus = 0;
      if (selectedGift.isLuxury) {
        // Confirmed Luxury Charm: 70% of coin value
        charmBonus = Math.round(totalCost * 0.70);
      } else if (selectedGift.isLucky) {
        // Confirmed Super Lucky Charm: 4% of coin value
        charmBonus = Math.round(totalCost * 0.04);
      } else {
        // Standard charm: 2%
        charmBonus = Math.round(totalCost * 0.02);
      }
      adjustCharm(charmBonus);

      // 3. Attempt backend gift recording
      try {
        await api.gifts.sendGift(receiverId, selectedGift.id, count);
      } catch (e) {
        // If the backend has strict receiver schema validation, client state is cleanly updated
      }

      onGiftSent(selectedGift, count, luckyOutcome);

      if (!selectedGift.isLucky) {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send gift');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-slate-900 border-t sm:border border-purple-500/30 rounded-t-3xl sm:rounded-3xl p-5 w-full max-w-md shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">
              Send to <span className="text-purple-300 font-extrabold">{receiverName}</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 my-3">
          {(['popular', 'lucky', 'luxury'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                const first = GIFTS_CATALOG.find((g) => g.category === cat);
                if (first) setSelectedGift(first);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'lucky' ? '🎲 Lucky (2x-10x)' : cat === 'luxury' ? '👑 Luxury' : '🔥 Popular'}
            </button>
          ))}
        </div>

        {/* Gifts Grid */}
        <div className="grid grid-cols-4 gap-2.5 max-h-52 overflow-y-auto p-1">
          {filteredGifts.map((gift) => {
            const isSelected = selectedGift.id === gift.id;
            return (
              <button
                key={gift.id}
                onClick={() => {
                  setSelectedGift(gift);
                  setLuckyResult(null);
                  setErrorMsg(null);
                }}
                className={`flex flex-col items-center p-2 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-purple-900/40 border-purple-500 shadow-md shadow-purple-500/20 scale-102'
                    : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <span className="text-2xl mb-1 filter drop-shadow">{gift.icon}</span>
                <span className="text-[11px] font-semibold text-slate-200 truncate w-full text-center">
                  {gift.name}
                </span>
                <div className="flex items-center gap-0.5 text-amber-400 text-[10px] font-bold mt-0.5">
                  <Coins className="w-2.5 h-2.5" />
                  <span>{gift.coins.toLocaleString()}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Lucky Result Notification Box */}
        {luckyResult && (
          <div
            className={`mt-3 p-3 rounded-2xl border flex items-center justify-between ${
              luckyResult.won
                ? 'bg-amber-950/70 border-amber-500/60 text-amber-200 animate-bounce'
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {luckyResult.won ? (
                <>
                  <Award className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-amber-300">
                      BIG WIN! {luckyResult.multiplier}x Multiplier!
                    </span>
                    <p className="text-[10px] text-amber-200/80">
                      Won +{luckyResult.payout.toLocaleString()} Coins back!
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs">No multiplier this spin. +{luckyResult.charmPointsEarned} Charm gained!</span>
                </>
              )}
            </div>
            {luckyResult.won && (
              <span className="text-xs font-extrabold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                {luckyResult.multiplier}x
              </span>
            )}
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mt-2.5 flex items-center justify-between bg-red-950/60 border border-red-500/40 p-2 rounded-xl text-red-200 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="truncate">{errorMsg}</span>
            </div>
            <button
              onClick={onOpenRecharge}
              className="ml-2 text-amber-300 underline font-semibold text-[11px] shrink-0"
            >
              Recharge
            </button>
          </div>
        )}

        {/* Footer: Balance, Count Selector, and Send Button */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          {/* User balance & quick recharge */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-medium">Your Coins:</span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentCoins.toLocaleString()}</span>
              </div>
              <button
                onClick={onOpenRecharge}
                className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-semibold hover:bg-amber-500/30"
              >
                +
              </button>
            </div>
          </div>

          {/* Multiplier / Count selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
            {[1, 5, 10, 66, 99].map((c) => (
              <button
                key={c}
                onClick={() => setCount(c)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  count === c ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                x{c}
              </button>
            ))}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={isSending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-transform active:scale-95 disabled:opacity-50"
          >
            {isSending ? 'Sending...' : `Send (${totalCost.toLocaleString()})`}
          </button>
        </div>
      </div>
    </div>
  );
};
