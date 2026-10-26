import { GiftItem } from '../types';

export const PRIMARY_BACKEND_URL = 'https://odooparty-live-backend.onrender.com';
export const MESO_BACKEND_URL = 'https://meso-live-backend.onrender.com';
export const BACKEND_URL = PRIMARY_BACKEND_URL;

// Backend Endpoints Configuration & Preservation
export const BACKEND_SERVERS = [
  {
    id: 'odooparty',
    name: 'OdooParty Live Server',
    url: 'https://odooparty-live-backend.onrender.com',
    type: 'Primary Backend',
    isSafe: true,
    note: 'Active server for OdooParty real-time audio rooms & live events',
  },
  {
    id: 'meso',
    name: 'Meso Live Server',
    url: 'https://meso-live-backend.onrender.com',
    type: 'Preserved Render Server',
    isSafe: true,
    note: 'Akkuma jirutti Render keessaa jira, gonkumaa hin haqamne',
  },
];

// 1. Host Levels and Rewards (Confirmed Policy Table)
export const HOST_LEVEL_POLICIES = [
  { level: 'S', sevenDayThreshold: 500000000, rewardPerHour: 2000000, maxHoursPerDay: 3 },
  { level: 'A', sevenDayThreshold: 200000000, rewardPerHour: 1000000, maxHoursPerDay: 3 },
  { level: 'B', sevenDayThreshold: 100000000, rewardPerHour: 500000, maxHoursPerDay: 3 },
  { level: 'C', sevenDayThreshold: 70000000, rewardPerHour: 350000, maxHoursPerDay: 3 },
  { level: 'D', sevenDayThreshold: 40000000, rewardPerHour: 300000, maxHoursPerDay: 3 },
  { level: 'E', sevenDayThreshold: 20000000, rewardPerHour: 150000, maxHoursPerDay: 3 },
  { level: 'F', sevenDayThreshold: 12000000, rewardPerHour: 120000, maxHoursPerDay: 3 },
  { level: 'G', sevenDayThreshold: 9000000, rewardPerHour: 90000, maxHoursPerDay: 3 },
  { level: 'H', sevenDayThreshold: 3000000, rewardPerHour: 45000, maxHoursPerDay: 2 },
  { level: 'I', sevenDayThreshold: 1500000, rewardPerHour: 30000, maxHoursPerDay: 2 },
  { level: 'J', sevenDayThreshold: 1000000, rewardPerHour: 20000, maxHoursPerDay: 2 },
  { level: 'K', sevenDayThreshold: 500000, rewardPerHour: 12000, maxHoursPerDay: 2 },
  { level: 'L', sevenDayThreshold: 0, rewardPerHour: 6000, maxHoursPerDay: 1 }, // 6,000 pts/hr
] as const;

// New Host Reward
export const NEW_HOST_REWARD_PER_HOUR = 80000;
export const NEW_HOST_ELIGIBLE_DAYS = 7;
export const NEW_HOST_TOTAL_CAP = 560000; // $5.6

// Daily host tasks (From Official Host Policy Section 3)
export const DAILY_HOST_TASKS = [
  { id: 'crown_mic_daily', title: 'Crown Mic Reward', rewardPoints: 3000, targetHours: 1 },
  { id: 'tcoin_gift_daily', title: 'Receive Tcoin Gift', rewardPoints: 1000, targetGifts: 1 },
  { id: 'gain_followers_daily', title: 'Gain Followers', rewardPoints: 1000, targetFollowers: 1 },
  { id: 'room_owner_daily', title: 'Crown Room Owner Reward', rewardPoints: 3840000, targetHours: 96 },
];

// 2. Game Room Owner Rewards
export const GAME_ROOM_REWARDS = [
  { level: 'A', sevenDayRevenueThreshold: 10000000000, rewardPerHour: 40000 },
  { level: 'B', sevenDayRevenueThreshold: 5000000000, rewardPerHour: 20000 },
  { level: 'C', sevenDayRevenueThreshold: 2000000000, rewardPerHour: 10000 },
  { level: 'D', sevenDayRevenueThreshold: 1000000000, rewardPerHour: 5000 },
  { level: 'E', sevenDayRevenueThreshold: 500000000, rewardPerHour: 2500 },
  { level: 'F', sevenDayRevenueThreshold: 100000000, rewardPerHour: 500 },
  { level: 'G', sevenDayRevenueThreshold: 50000000, rewardPerHour: 300 },
  { level: 'H', sevenDayRevenueThreshold: 30000000, rewardPerHour: 200 },
  { level: 'I', sevenDayRevenueThreshold: 10000000, rewardPerHour: 100 },
] as const;

// 3. Agency Commissions (Confirmed Official Agency Policy Table)
export const AGENCY_COMMISSION_TIERS = [
  { level: 'D', threshold: 0, commissionRate: 0.08, label: '8%' },
  { level: 'C', threshold: 20000000, commissionRate: 0.12, label: '12%' },
  { level: 'B', threshold: 100000000, commissionRate: 0.16, label: '16%' },
  { level: 'A', threshold: 500000000, commissionRate: 0.18, label: '18%' },
  { level: 'S', threshold: 1500000000, commissionRate: 0.20, label: '20%' },
  { level: 'S+', threshold: -1, commissionRate: 0.21, label: '21% (Invite 2 S-Agencies)' },
] as const;

// 4. Coin Seller Pricing & Eligibility
export const COIN_SELLER_PRICING = {
  BEGINNER: { coinsPerUsd: 96000, label: '$1 = 96,000 Coins', minQualifyingRechargeUsd: 0 },
  STANDARD: { coinsPerUsd: 98000, label: '$1 = 98,000 Coins', minQualifyingRechargeUsd: 200 },
  SENIOR: { coinsPerUsd: 100000, label: '$1 = 100,000 Coins', minQualifyingRechargeUsd: 1000 },
};

// 5. Withdrawal Rules
export const WITHDRAWAL_MIN_USD = 10;
export const POINTS_PER_USD = 100000; // 100,000 Points = $1

// 6. Confirmed Wealth Thresholds (Recharge Coins Only)
export const CONFIRMED_WEALTH_THRESHOLDS = [
  { level: 1, threshold: 0, title: 'Newbie', medal: 'Bronze' as const },
  { level: 2, threshold: 100000, title: 'Active', medal: 'Bronze' as const },
  { level: 3, threshold: 250000, title: 'Explorer', medal: 'Bronze' as const },
  { level: 4, threshold: 400000, title: 'Patron', medal: 'Bronze' as const },
  { level: 5, threshold: 500000, title: 'Contributor', medal: 'Bronze' as const },
  { level: 6, threshold: 1000000, title: 'Supporter', medal: 'Bronze' as const },
  { level: 10, threshold: 3000000, title: 'Elite Patron', medal: 'Silver' as const },
  { level: 20, threshold: 8000000, title: 'High Roller', medal: 'Gold' as const },
];

// 7. Confirmed Charm Thresholds (From Gifts Received)
export const CONFIRMED_CHARM_THRESHOLDS = [
  { level: 1, threshold: 0, title: 'Novice Star', medal: 'Bronze' as const },
  { level: 2, threshold: 500000, title: 'Rising Star', medal: 'Bronze' as const },
  { level: 3, threshold: 1500000, title: 'Shining Star', medal: 'Bronze' as const },
  { level: 5, threshold: 5000000, title: 'Radiant', medal: 'Bronze' as const },
  { level: 10, threshold: 20000000, title: 'Icon', medal: 'Silver' as const },
  { level: 20, threshold: 80000000, title: 'Superstar', medal: 'Gold' as const },
  { level: 30, threshold: 200000000, title: 'Legend', medal: 'Diamond' as const },
  { level: 40, threshold: 500000000, title: 'Mythic', medal: 'Diamond' as const },
  { level: 50, threshold: 1000000000, title: 'Celestial', medal: 'Diamond' as const },
];

// Helper to calculate Medal category
export function getMedalCategory(level: number): 'Bronze' | 'Silver' | 'Gold' | 'Diamond' {
  if (level >= 30) return 'Diamond';
  if (level >= 20) return 'Gold';
  if (level >= 10) return 'Silver';
  return 'Bronze';
}

// 8. Confirmed Gift Catalog
export const GIFTS_CATALOG: GiftItem[] = [
  { id: 'rose', name: 'Rose', coins: 10, icon: '🌹', category: 'popular', charmBonusPercent: 2 },
  { id: 'clap', name: 'Applause', coins: 50, icon: '👏', category: 'popular', charmBonusPercent: 2 },
  { id: 'coffee', name: 'Macchiato', coins: 100, icon: '☕', category: 'popular', charmBonusPercent: 2 },
  { id: 'heart', name: 'Love Heart', coins: 500, icon: '💖', category: 'popular', charmBonusPercent: 2 },
  { id: 'crown_mini', name: 'Golden Mic', coins: 1000, icon: '🎙️', category: 'popular', charmBonusPercent: 2 },
  // Lucky gifts (20% win chance: 2x, 5x, 10x)
  { id: 'lucky_dice', name: 'Lucky Dice', coins: 20, icon: '🎲', isLucky: true, category: 'lucky', charmBonusPercent: 4 },
  { id: 'lucky_chest', name: 'Lucky Chest', coins: 100, icon: '🎁', isLucky: true, category: 'lucky', charmBonusPercent: 4 },
  { id: 'lucky_wheel', name: 'Lucky Wheel', coins: 500, icon: '🎡', isLucky: true, category: 'lucky', charmBonusPercent: 4 },
  // Luxury gifts (70% Charm rule)
  { id: 'luxury_sports_car', name: 'Cyber Roadster', coins: 5000, icon: '🏎️', isLuxury: true, category: 'luxury', charmBonusPercent: 70 },
  { id: 'luxury_yacht', name: 'Golden Yacht', coins: 20000, icon: '🛥️', isLuxury: true, category: 'luxury', charmBonusPercent: 70 },
  { id: 'luxury_castle', name: 'Imperial Castle', coins: 100000, icon: '🏰', isLuxury: true, category: 'luxury', charmBonusPercent: 70 },
];
