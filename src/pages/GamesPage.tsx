import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Gamepad2,
  Coins,
  Sparkles,
  Trophy,
  Play,
  RotateCw,
  Flame,
  Award,
  AlertCircle,
} from 'lucide-react';

export const GamesPage: React.FC = () => {
  const { user, adjustCoins } = useAuth();
  const [selectedGame, setSelectedGame] = useState<'jackpot' | 'keno' | '777' | 'jungle' | 'fish'>('jackpot');
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<{ win: boolean; payout: number; message: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 777 Slot state
  const [reels, setReels] = useState<string[]>(['7️⃣', '💎', '🍒']);

  // Keno state
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([3, 7, 11, 15, 19]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);

  // Jungle Hunt state
  const [jungleAnimal, setJungleAnimal] = useState<string>('🦁');

  // Fish Hunter state
  const [fishTarget, setFishTarget] = useState<string>('🐠');

  const currentCoins = user?.coins || 0;

  // 1. Play 777 Slot
  const play777 = () => {
    const symbols = ['7️⃣', '💎', '🍒', '🔔', '🍋', '⭐'];
    const r1 = symbols[Math.floor(Math.random() * symbols.length)];
    const r2 = symbols[Math.floor(Math.random() * symbols.length)];
    const r3 = symbols[Math.floor(Math.random() * symbols.length)];
    setReels([r1, r2, r3]);

    if (r1 === '7️⃣' && r2 === '7️⃣' && r3 === '7️⃣') {
      const win = betAmount * 50;
      adjustCoins(win);
      return { win: true, payout: win, message: `JACKPOT 777! You won ${win.toLocaleString()} Coins!` };
    } else if (r1 === r2 && r2 === r3) {
      const win = betAmount * 15;
      adjustCoins(win);
      return { win: true, payout: win, message: `Triple Match! You won ${win.toLocaleString()} Coins!` };
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      const win = betAmount * 2;
      adjustCoins(win);
      return { win: true, payout: win, message: `Double Match! You won ${win.toLocaleString()} Coins!` };
    }
    return { win: false, payout: 0, message: 'No match. Better luck next spin!' };
  };

  // 2. Play MegaJackpot
  const playJackpot = () => {
    const rand = Math.random();
    if (rand < 0.05) {
      const win = betAmount * 100;
      adjustCoins(win);
      return { win: true, payout: win, message: `GRAND MEGA JACKPOT! Won ${win.toLocaleString()} Coins (100x)!` };
    } else if (rand < 0.20) {
      const win = betAmount * 5;
      adjustCoins(win);
      return { win: true, payout: win, message: `Major Hit! Won ${win.toLocaleString()} Coins (5x)!` };
    } else if (rand < 0.35) {
      const win = betAmount * 2;
      adjustCoins(win);
      return { win: true, payout: win, message: `Mini Win! Won ${win.toLocaleString()} Coins (2x)!` };
    }
    return { win: false, payout: 0, message: 'Try again for the progressive pot!' };
  };

  // 3. Play Keno
  const playKeno = () => {
    const draw: number[] = [];
    while (draw.length < 5) {
      const n = Math.floor(Math.random() * 20) + 1;
      if (!draw.includes(n)) draw.push(n);
    }
    setDrawnNumbers(draw);

    const matches = selectedNumbers.filter((n) => draw.includes(n)).length;
    let multiplier = 0;
    if (matches === 5) multiplier = 100;
    else if (matches === 4) multiplier = 25;
    else if (matches === 3) multiplier = 8;
    else if (matches === 2) multiplier = 3;
    else if (matches === 1) multiplier = 1.5;

    if (multiplier > 0) {
      const win = Math.round(betAmount * multiplier);
      adjustCoins(win);
      return { win: true, payout: win, message: `${matches} Numbers Matched! Won ${win.toLocaleString()} Coins (${multiplier}x)!` };
    }
    return { win: false, payout: 0, message: '0 matches. Draw again!' };
  };

  // 4. Play Jungle Hunt
  const playJungle = () => {
    const animals = [
      { name: 'Lion', icon: '🦁', mult: 12, chance: 0.1 },
      { name: 'Elephant', icon: '🐘', mult: 8, chance: 0.15 },
      { name: 'Cheetah', icon: '🐆', mult: 5, chance: 0.25 },
      { name: 'Monkey', icon: '🐒', mult: 2, chance: 0.35 },
    ];
    const rand = Math.random();
    let accumulated = 0;
    let chosen = animals[animals.length - 1];
    for (const a of animals) {
      accumulated += a.chance;
      if (rand <= accumulated) {
        chosen = a;
        break;
      }
    }
    setJungleAnimal(chosen.icon);

    if (rand < 0.45) {
      const win = betAmount * chosen.mult;
      adjustCoins(win);
      return { win: true, payout: win, message: `Captured ${chosen.name}! Won ${win.toLocaleString()} Coins (${chosen.mult}x)!` };
    }
    return { win: false, payout: 0, message: `${chosen.name} escaped into the jungle!` };
  };

  // 5. Play Fish Hunter
  const playFish = () => {
    const fishes = [
      { name: 'Golden Dragon', icon: '🐉', mult: 50, chance: 0.05 },
      { name: 'Hammerhead Shark', icon: '🦈', mult: 20, chance: 0.12 },
      { name: 'Jellyfish', icon: '🪼', mult: 5, chance: 0.25 },
      { name: 'Clownfish', icon: '🐠', mult: 2, chance: 0.40 },
    ];
    const rand = Math.random();
    let accumulated = 0;
    let chosen = fishes[fishes.length - 1];
    for (const f of fishes) {
      accumulated += f.chance;
      if (rand <= accumulated) {
        chosen = f;
        break;
      }
    }
    setFishTarget(chosen.icon);

    if (rand < 0.40) {
      const win = betAmount * chosen.mult;
      adjustCoins(win);
      return { win: true, payout: win, message: `Target struck! Catch: ${chosen.name}! Won ${win.toLocaleString()} Coins (${chosen.mult}x)!` };
    }
    return { win: false, payout: 0, message: 'Harpoon missed target underwater!' };
  };

  const handleActionPlay = () => {
    setErrorMsg(null);
    setGameResult(null);

    if (currentCoins < betAmount) {
      setErrorMsg(`Insufficient coins. You have ${currentCoins.toLocaleString()} Coins.`);
      return;
    }

    setIsPlaying(true);
    adjustCoins(-betAmount);

    setTimeout(() => {
      let res;
      if (selectedGame === '777') res = play777();
      else if (selectedGame === 'keno') res = playKeno();
      else if (selectedGame === 'jungle') res = playJungle();
      else if (selectedGame === 'fish') res = playFish();
      else res = playJackpot();

      setGameResult(res);
      setIsPlaying(false);
    }, 700);
  };

  return (
    <div className="pb-24 px-3 max-w-md mx-auto w-full space-y-3.5 pt-2">
      {/* Game Selector Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-pink-600/30 text-pink-300">
            <Gamepad2 className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Live Mini Games</h2>
            <span className="text-[11px] text-slate-400">Server RNG & Real Coin Payouts</span>
          </div>
        </div>

        {/* Balance chip */}
        <div className="flex items-center gap-1 bg-slate-900 border border-amber-500/30 px-2.5 py-1 rounded-full text-xs font-bold text-amber-300">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>{currentCoins.toLocaleString()}</span>
        </div>
      </div>

      {/* Game Selector Cards */}
      <div className="grid grid-cols-5 gap-1.5">
        {[
          { id: 'jackpot', label: 'MegaJackpot', icon: '🎰' },
          { id: 'keno', label: 'Keno', icon: '🎱' },
          { id: '777', label: '777 Slots', icon: '💎' },
          { id: 'jungle', label: 'Jungle Hunt', icon: '🦁' },
          { id: 'fish', label: 'Fish Hunter', icon: '🐠' },
        ].map((g) => (
          <button
            key={g.id}
            onClick={() => {
              setSelectedGame(g.id as any);
              setGameResult(null);
            }}
            className={`flex flex-col items-center p-2 rounded-2xl border transition-all text-center ${
              selectedGame === g.id
                ? 'bg-purple-900/50 border-purple-500 shadow-md shadow-purple-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="text-xl mb-1">{g.icon}</span>
            <span className="text-[10px] font-bold truncate w-full text-white">{g.label}</span>
          </button>
        ))}
      </div>

      {/* Game Active Stage */}
      <div className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* 1. 777 Slots */}
        {selectedGame === '777' && (
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block">
              777 Triple Star High Roller
            </span>
            <div className="flex justify-center gap-3 my-4">
              {reels.map((symbol, idx) => (
                <div
                  key={idx}
                  className={`w-20 h-24 rounded-2xl bg-slate-800/90 border-2 border-purple-500/50 flex items-center justify-center text-4xl shadow-inner ${
                    isPlaying ? 'animate-bounce' : ''
                  }`}
                >
                  {symbol}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              Triple 7️⃣ = 50x • Any 3 Match = 15x • Any Pair = 2x
            </p>
          </div>
        )}

        {/* 2. MegaJackpot */}
        {selectedGame === 'jackpot' && (
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
              MegaJackpot Progressive Pot
            </span>
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-purple-950/60 to-slate-900 border border-amber-500/50">
              <span className="text-[10px] text-amber-200 uppercase font-semibold">Current Jackpot Pot:</span>
              <div className="text-3xl font-black text-amber-300 animate-pulse my-1">
                8,490,000 Coins
              </div>
              <span className="text-[10px] text-slate-300">Grand Win (100x) • Major (5x) • Mini (2x)</span>
            </div>
          </div>
        )}

        {/* 3. Keno */}
        {selectedGame === 'keno' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300">Pick 5 Lucky Numbers (1–20)</span>
              <span className="text-[10px] text-slate-400">Selected: {selectedNumbers.length}/5</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => {
                const isSelected = selectedNumbers.includes(num);
                const isDrawn = drawnNumbers.includes(num);
                return (
                  <button
                    key={num}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
                      } else if (selectedNumbers.length < 5) {
                        setSelectedNumbers([...selectedNumbers, num]);
                      }
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      isDrawn && isSelected
                        ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 animate-pulse'
                        : isSelected
                        ? 'bg-purple-600 text-white'
                        : isDrawn
                        ? 'bg-amber-500/30 text-amber-300'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Jungle Hunt */}
        {selectedGame === 'jungle' && (
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block">
              Jungle Hunt Safari Spinner
            </span>
            <div className="w-24 h-24 mx-auto rounded-full bg-slate-800 border-4 border-amber-500/50 flex items-center justify-center text-5xl shadow-xl">
              {jungleAnimal}
            </div>
            <p className="text-[11px] text-slate-400">
              🦁 Lion (12x) • 🐘 Elephant (8x) • 🐆 Cheetah (5x) • 🐒 Monkey (2x)
            </p>
          </div>
        )}

        {/* 5. Fish Hunter */}
        {selectedGame === 'fish' && (
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest block">
              Ocean Cannon Fish Hunter
            </span>
            <div className="w-24 h-24 mx-auto rounded-full bg-cyan-950/60 border-4 border-cyan-500/50 flex items-center justify-center text-5xl shadow-xl">
              {fishTarget}
            </div>
            <p className="text-[11px] text-slate-400">
              🐉 Dragon (50x) • 🦈 Shark (20x) • 🪼 Jellyfish (5x) • 🐠 Clownfish (2x)
            </p>
          </div>
        )}

        {/* Result Announcement */}
        {gameResult && (
          <div
            className={`mt-4 p-3 rounded-2xl border text-xs flex items-center justify-between ${
              gameResult.win
                ? 'bg-amber-950/70 border-amber-500 text-amber-200 animate-bounce'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {gameResult.win ? <Trophy className="w-5 h-5 text-amber-400 shrink-0" /> : <Flame className="w-4 h-4 text-slate-400 shrink-0" />}
              <div>
                <span className="font-bold block">{gameResult.message}</span>
              </div>
            </div>
            {gameResult.win && (
              <span className="font-black text-xs bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                WIN!
              </span>
            )}
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mt-3 flex items-center gap-2 bg-red-950/60 border border-red-500/40 p-2 rounded-xl text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Bet Selection & Play Button */}
        <div className="mt-5 pt-3 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Select Bet Amount:</span>
            <div className="flex items-center gap-1">
              {[10, 50, 100, 500, 1000].map((b) => (
                <button
                  key={b}
                  onClick={() => setBetAmount(b)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    betAmount === b
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleActionPlay}
            disabled={isPlaying}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition-transform active:scale-95 disabled:opacity-50"
          >
            {isPlaying ? (
              <RotateCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>SPIN / PLAY ({betAmount} Coins)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
