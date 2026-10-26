export type UserRole = 'USER' | 'HOST' | 'AGENT' | 'ADMIN';

export interface LevelInfo {
  level: number;
  points: number;
  title: string;
  medal: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  nextLevel: number;
  nextLevelPoints: number;
  progress: number;
}

export interface User {
  _id: string;
  id?: string;
  publicId?: number;
  customId?: number;
  username: string;
  email?: string;
  name?: string;
  role: UserRole;
  isHost: boolean;
  isAgent: boolean;
  isVerifiedHost?: boolean;
  isVerified?: boolean;
  isFaceVerified?: boolean;
  faceVerificationStatus?: 'Pending' | 'Approved' | 'Rejected' | 'NOT_SUBMITTED';
  hostVerificationStatus?: 'Pending' | 'Approved' | 'Rejected' | 'NOT_SUBMITTED';
  coins: number;
  diamonds: number;
  points?: number;
  totalRechargedCoins: number;
  charmPoints: number;
  wealthLevel?: LevelInfo;
  charmLevel?: LevelInfo;
  avatar?: string;
  profilePicture?: string;
  cover?: string;
  bio?: string;
  country?: string;
  countryFlag?: string;
  followersCount?: number;
  followingCount?: number;
  agencyId?: string | null;
  agencyName?: string;
  agencyStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  sellerTier?: 'NONE' | 'BEGINNER' | 'STANDARD' | 'SENIOR';
  hostEarningsUsd?: number;
  hostStartDate?: string | null;
  createdAt?: string;
}

export interface RoomSeat {
  seatIndex: number; // 0 to 24 (total 25 seats)
  isHostSeat?: boolean; // Seat 0 (Host)
  isCrownMic?: boolean; // Seats 1 to 4 (Crown Mic 1-4)
  user?: {
    _id: string;
    username: string;
    avatar?: string;
    role?: UserRole;
    wealthLevel?: number;
    charmLevel?: number;
  } | null;
  isMuted: boolean;
  isLocked: boolean;
  speaking?: boolean;
  audioLevel?: number;
}

export interface VoiceRoom {
  _id: string;
  id?: string;
  title: string;
  topic?: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  coverImage?: string;
  noticeBoard?: string;
  tags?: string[];
  seats: RoomSeat[];
  onlineCount: number;
  diamondsCollected?: number;
  isLive: boolean;
  gameActive?: boolean;
  createdAt: string;
}

export interface RoomChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  role?: UserRole;
  wealthLevel?: number;
  charmLevel?: number;
  text: string;
  isSystem?: boolean;
  isGift?: boolean;
  giftData?: {
    giftName: string;
    giftIcon: string;
    count: number;
    multiplier?: number;
  };
  timestamp: string;
}

export interface GiftItem {
  id: string;
  name: string;
  coins: number;
  icon: string;
  isLucky?: boolean;
  isLuxury?: boolean;
  category: 'popular' | 'lucky' | 'luxury' | 'exclusive';
  charmBonusPercent: number; // e.g. 4 for super lucky, 70 for luxury
}

export interface LuckyGiftResult {
  won: boolean;
  multiplier: 2 | 5 | 10 | 0;
  payout: number;
  charmPointsEarned: number;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  reward: number; // in Points or Coins
  type: 'daily' | 'weekly' | 'host';
  requirementTarget: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  claimedAt?: string | null;
}

export interface WithdrawalRequest {
  id: string;
  pointsAmount: number;
  usdAmount: number;
  feeUsd: number;
  netUsd: number;
  paymentMethod: 'CBE' | 'Telebirr' | 'Crypto' | 'Bank Transfer';
  accountDetails: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  createdAt: string;
}

export interface AgencyStats {
  agencyLevel: 'D' | 'C' | 'B' | 'A' | 'S' | 'S+';
  commissionRate: number; // e.g. 0.08 to 0.20
  totalCommissionCoins: number;
  hostTeamRevenue: number;
  subAgencyRevenue: number;
  activeHostsCount: number;
  subAgenciesCount: number;
}

export interface CoinSellerInfo {
  tier: 'NONE' | 'BEGINNER' | 'STANDARD' | 'SENIOR';
  coinsPerUsd: number; // 96,000 | 98,000 | 100,000
  isAgentApproved: boolean;
  highestSingleRechargeUsd: number;
  totalSoldCoins: number;
}
