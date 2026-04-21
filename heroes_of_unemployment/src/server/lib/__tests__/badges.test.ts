import { describe, it, expect } from "vitest";
import { evaluateBadges, type UserStatsForBadges } from "../badges";

const baseStats: UserStatsForBadges = {
	totalApplications: 0,
	distinctCompanies: 0,
	currentStreakDays: 0,
	level: 1,
	profileComplete: false,
	appliedToRecentPostingWithin3Days: false,
	alreadyEarnedCodes: new Set<string>(),
};

describe("evaluateBadges", () => {
	it("awards FIRST_APPLICATION on the first application", () => {
		const result = evaluateBadges({ ...baseStats, totalApplications: 1 });
		expect(result).toContain("FIRST_APPLICATION");
		expect(result).not.toContain("TEN_APPLICATIONS");
	});

	it("awards TEN_APPLICATIONS at 10 applications", () => {
		const result = evaluateBadges({ ...baseStats, totalApplications: 10 });
		expect(result).toContain("TEN_APPLICATIONS");
	});

	it("awards FIFTY_APPLICATIONS at 50 applications", () => {
		const result = evaluateBadges({ ...baseStats, totalApplications: 50 });
		expect(result).toContain("FIFTY_APPLICATIONS");
	});

	it("does not re-award badges already in alreadyEarnedCodes", () => {
		const result = evaluateBadges({
			...baseStats,
			totalApplications: 10,
			alreadyEarnedCodes: new Set(["FIRST_APPLICATION", "TEN_APPLICATIONS"]),
		});
		expect(result).not.toContain("FIRST_APPLICATION");
		expect(result).not.toContain("TEN_APPLICATIONS");
	});

	it("awards EARLY_BIRD only when the flag is true", () => {
		expect(
			evaluateBadges({
				...baseStats,
				totalApplications: 1,
				appliedToRecentPostingWithin3Days: false,
			}),
		).not.toContain("EARLY_BIRD");
		expect(
			evaluateBadges({
				...baseStats,
				totalApplications: 1,
				appliedToRecentPostingWithin3Days: true,
			}),
		).toContain("EARLY_BIRD");
	});

	it("awards EXPLORER at 5 distinct companies", () => {
		const result = evaluateBadges({
			...baseStats,
			totalApplications: 5,
			distinctCompanies: 5,
		});
		expect(result).toContain("EXPLORER");
	});

	it("awards HERO_LEVEL at level 20", () => {
		const result = evaluateBadges({ ...baseStats, level: 20 });
		expect(result).toContain("HERO_LEVEL");
	});

	it("awards WEEKLY_STREAK at 7-day streak", () => {
		const result = evaluateBadges({ ...baseStats, currentStreakDays: 7 });
		expect(result).toContain("WEEKLY_STREAK");
	});

	it("awards PROFILE_COMPLETE when flag is true", () => {
		const result = evaluateBadges({ ...baseStats, profileComplete: true });
		expect(result).toContain("PROFILE_COMPLETE");
	});
});
