export const BADGE_CODES = {
	FIRST_APPLICATION: "FIRST_APPLICATION",
	TEN_APPLICATIONS: "TEN_APPLICATIONS",
	FIFTY_APPLICATIONS: "FIFTY_APPLICATIONS",
	HERO_LEVEL: "HERO_LEVEL",
	WEEKLY_STREAK: "WEEKLY_STREAK",
	PROFILE_COMPLETE: "PROFILE_COMPLETE",
	EARLY_BIRD: "EARLY_BIRD",
	EXPLORER: "EXPLORER",
	PHONE_SCREEN_EARNED: "PHONE_SCREEN_EARNED",
	INTERVIEW_EARNED: "INTERVIEW_EARNED",
	OFFER_RECEIVED: "OFFER_RECEIVED",
	BATTLE_HARDENED: "BATTLE_HARDENED",
} as const;

export type BadgeCode = (typeof BADGE_CODES)[keyof typeof BADGE_CODES];

export interface BadgeDefinition {
	code: BadgeCode;
	name: string;
	description: string;
	emoji: string;
	xpReward: number;
	tier: "bronze" | "silver" | "gold";
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
	{
		code: "FIRST_APPLICATION",
		name: "First Steps",
		description: "Applied to your first internship.",
		emoji: "🚀",
		xpReward: 25,
		tier: "bronze",
	},
	{
		code: "TEN_APPLICATIONS",
		name: "Getting Serious",
		description: "Submitted 10 applications.",
		emoji: "🎯",
		xpReward: 50,
		tier: "silver",
	},
	{
		code: "FIFTY_APPLICATIONS",
		name: "Grind Mode",
		description: "Submitted 50 applications.",
		emoji: "🔥",
		xpReward: 150,
		tier: "gold",
	},
	{
		code: "HERO_LEVEL",
		name: "Hero Ascended",
		description: "Reached level 20.",
		emoji: "👑",
		xpReward: 100,
		tier: "gold",
	},
	{
		code: "WEEKLY_STREAK",
		name: "Daily Grinder",
		description: "Applied on 7 different days in a row.",
		emoji: "📅",
		xpReward: 75,
		tier: "silver",
	},
	{
		code: "PROFILE_COMPLETE",
		name: "Full Sheet",
		description: "Completed every profile field.",
		emoji: "📋",
		xpReward: 25,
		tier: "bronze",
	},
	{
		code: "EARLY_BIRD",
		name: "Early Bird",
		description: "Applied within 3 days of a posting going up.",
		emoji: "🌅",
		xpReward: 40,
		tier: "silver",
	},
	{
		code: "EXPLORER",
		name: "Explorer",
		description: "Applied to 5 different companies.",
		emoji: "🧭",
		xpReward: 40,
		tier: "silver",
	},
	{
		code: "PHONE_SCREEN_EARNED",
		name: "Called to Arms",
		description: "Landed your first phone screen.",
		emoji: "📞",
		xpReward: 30,
		tier: "bronze",
	},
	{
		code: "INTERVIEW_EARNED",
		name: "Proving Grounds",
		description: "Reached the interview stage.",
		emoji: "⚔️",
		xpReward: 50,
		tier: "silver",
	},
	{
		code: "OFFER_RECEIVED",
		name: "Victorious",
		description: "Received a job offer.",
		emoji: "🏆",
		xpReward: 200,
		tier: "gold",
	},
	{
		code: "BATTLE_HARDENED",
		name: "Battle Hardened",
		description: "Weathered 5 rejections and kept going.",
		emoji: "🛡️",
		xpReward: 25,
		tier: "bronze",
	},
];

export interface UserStatsForBadges {
	totalApplications: number;
	distinctCompanies: number;
	currentStreakDays: number;
	level: number;
	profileComplete: boolean;
	appliedToRecentPostingWithin3Days: boolean;
	alreadyEarnedCodes: Set<string>;
}

export interface PipelineStatsForBadges {
	hasPhoneScreen: boolean;
	hasInterview: boolean;
	hasOffer: boolean;
	rejectionCount: number;
	alreadyEarnedCodes: Set<string>;
}

export function evaluatePipelineBadges(
	stats: PipelineStatsForBadges,
): BadgeCode[] {
	const earned: BadgeCode[] = [];
	const check = (code: BadgeCode, qualifies: boolean) => {
		if (qualifies && !stats.alreadyEarnedCodes.has(code)) {
			earned.push(code);
		}
	};
	check("PHONE_SCREEN_EARNED", stats.hasPhoneScreen);
	check("INTERVIEW_EARNED", stats.hasInterview);
	check("OFFER_RECEIVED", stats.hasOffer);
	check("BATTLE_HARDENED", stats.rejectionCount >= 5);
	return earned;
}

export function evaluateBadges(stats: UserStatsForBadges): BadgeCode[] {
	const earned: BadgeCode[] = [];
	const check = (code: BadgeCode, qualifies: boolean) => {
		if (qualifies && !stats.alreadyEarnedCodes.has(code)) {
			earned.push(code);
		}
	};

	check("FIRST_APPLICATION", stats.totalApplications >= 1);
	check("TEN_APPLICATIONS", stats.totalApplications >= 10);
	check("FIFTY_APPLICATIONS", stats.totalApplications >= 50);
	check("HERO_LEVEL", stats.level >= 20);
	check("WEEKLY_STREAK", stats.currentStreakDays >= 7);
	check("PROFILE_COMPLETE", stats.profileComplete);
	check("EARLY_BIRD", stats.appliedToRecentPostingWithin3Days);
	check("EXPLORER", stats.distinctCompanies >= 5);

	return earned;
}
