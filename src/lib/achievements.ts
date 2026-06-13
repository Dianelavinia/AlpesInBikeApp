/**
 * Système de gamification : badges, défis, classements.
 */

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  goal?: number;
};

export type Challenge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  endsAt: string;
  participants: number;
  progress: number;
  goal: number;
  unit: string;
  reward: string;
};

export type LeaderboardEntry = {
  rank: number;
  userName: string;
  avatar: string;
  kmThisMonth: number;
  elevationThisMonth: number;
  badges: number;
  isYou?: boolean;
};

export const BADGES: Badge[] = [
  { id: "b-1", name: "Premier ride", description: "Votre première sortie enregistrée", icon: "flag", color: "#0D4F3D", unlocked: true, unlockedAt: "10 juin" },
  { id: "b-2", name: "100 km", description: "Cumul 100 km de rides", icon: "speedometer", color: "#0369A1", unlocked: true, unlockedAt: "15 juin" },
  { id: "b-3", name: "Lever de soleil", description: "Ride avant 8h", icon: "sunny", color: "#F59E0B", unlocked: true, unlockedAt: "10 juin" },
  { id: "b-4", name: "Sommet du Revard", description: "Atteindre 1538 m d'altitude", icon: "trending-up", color: "#E15A23", unlocked: true, unlockedAt: "10 juin" },
  { id: "b-5", name: "1000 km", description: "Cumul 1000 km annuels", icon: "trophy", color: "#FACC15", unlocked: false, progress: 348, goal: 1000 },
  { id: "b-6", name: "Tour du lac complet", description: "Faire les 44 km autour du Bourget", icon: "water", color: "#0EA5E9", unlocked: false, progress: 28, goal: 44 },
  { id: "b-7", name: "5 000 m de dénivelé", description: "Cumul mensuel", icon: "trail-sign", color: "#7C3AED", unlocked: false, progress: 2840, goal: 5000 },
  { id: "b-8", name: "Famille en route", description: "Ride en mode famille avec 3+ membres", icon: "people", color: "#0D4F3D", unlocked: false, progress: 0, goal: 1 },
];

export const CHALLENGES: Challenge[] = [
  { id: "c-1", name: "Défi Juin Bauges", description: "Cumuler 200 km dans le parc des Bauges", icon: "leaf", endsAt: "30 juin", participants: 124, progress: 78, goal: 200, unit: "km", reward: "Badge Bauges Master + bon -15% location" },
  { id: "c-2", name: "Lève-tôt", description: "5 rides avant 8h ce mois", icon: "sunny", endsAt: "30 juin", participants: 68, progress: 2, goal: 5, unit: "rides", reward: "Badge Sunrise Rider" },
  { id: "c-3", name: "Tour des lacs", description: "Visiter les 3 lacs (Bourget, Annecy, Aiguebelette)", icon: "water", endsAt: "31 août", participants: 245, progress: 1, goal: 3, unit: "lacs", reward: "Badge Tri-lacs + photo cadeau" },
];

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userName: "Thomas Dubois", avatar: "TD", kmThisMonth: 482, elevationThisMonth: 8420, badges: 18 },
  { rank: 2, userName: "Marc Lefèvre", avatar: "ML", kmThisMonth: 367, elevationThisMonth: 5210, badges: 14 },
  { rank: 3, userName: "Léa Martin", avatar: "LM", kmThisMonth: 312, elevationThisMonth: 4180, badges: 11 },
  { rank: 4, userName: "Marie Roche", avatar: "MR", kmThisMonth: 248, elevationThisMonth: 3120, badges: 8, isYou: true },
  { rank: 5, userName: "Camille Rivière", avatar: "CR", kmThisMonth: 210, elevationThisMonth: 2940, badges: 7 },
  { rank: 6, userName: "Sophie F.", avatar: "SF", kmThisMonth: 184, elevationThisMonth: 1820, badges: 6 },
];
