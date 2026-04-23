export const XP_REWARDS = {
	APPLICATION: 10,
	FIRST_OF_COMPANY: 5,
	DAILY_STREAK_PER_DAY: 5,
	DAILY_STREAK_CAP: 7,
	PROFILE_COMPLETE: 25,
	FIRST_BADGE: 50,
	PHONE_SCREEN: 15,
	INTERVIEW: 25,
	FINAL_ROUND: 40,
	OFFER: 100,
	REJECTION: 5,
} as const;

export const APPLICATION_STATUSES = [
	"APPLIED",
	"PHONE_SCREEN",
	"INTERVIEW",
	"FINAL_ROUND",
	"OFFER",
	"REJECTED",
	"GHOSTED",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_ORDER: Record<ApplicationStatus, number> = {
	APPLIED: 0,
	PHONE_SCREEN: 1,
	INTERVIEW: 2,
	FINAL_ROUND: 3,
	OFFER: 4,
	REJECTED: 4,
	GHOSTED: 4,
};

export const STATUS_XP: Partial<Record<ApplicationStatus, number>> = {
	PHONE_SCREEN: XP_REWARDS.PHONE_SCREEN,
	INTERVIEW: XP_REWARDS.INTERVIEW,
	FINAL_ROUND: XP_REWARDS.FINAL_ROUND,
	OFFER: XP_REWARDS.OFFER,
	REJECTED: XP_REWARDS.REJECTION,
};

export type Tier = "Rookie" | "Squire" | "Knight" | "Hero" | "Legend";

export interface TierInfo {
	tier: Tier;
	color: string;
	emoji: string;
}

export function xpForLevel(level: number): number {
	if (level <= 1) return 0;
	return 50 * level * (level - 1);
}

export function levelForXp(xp: number): number {
	if (xp <= 0) return 1;
	let level = 1;
	while (xpForLevel(level + 1) <= xp) {
		level++;
	}
	return level;
}

export function xpToNextLevel(xp: number): number {
	const current = levelForXp(xp);
	return xpForLevel(current + 1) - xp;
}

export function xpProgressInLevel(
	xp: number,
): { current: number; needed: number; pct: number } {
	const level = levelForXp(xp);
	const levelStart = xpForLevel(level);
	const levelEnd = xpForLevel(level + 1);
	const current = xp - levelStart;
	const needed = levelEnd - levelStart;
	const pct = needed === 0 ? 0 : Math.min(100, (current / needed) * 100);
	return { current, needed, pct };
}

export function tierForLevel(level: number): TierInfo {
	if (level >= 30) return { tier: "Legend", color: "#fbbf24", emoji: "🌟" };
	if (level >= 20) return { tier: "Hero", color: "#f87171", emoji: "🦸" };
	if (level >= 10) return { tier: "Knight", color: "#60a5fa", emoji: "🛡️" };
	if (level >= 5) return { tier: "Squire", color: "#a78bfa", emoji: "⚔️" };
	return { tier: "Rookie", color: "#9ca3af", emoji: "🌱" };
}

export function streakBonus(consecutiveDays: number): number {
	const capped = Math.min(
		Math.max(0, consecutiveDays),
		XP_REWARDS.DAILY_STREAK_CAP,
	);
	return capped * XP_REWARDS.DAILY_STREAK_PER_DAY;
}
