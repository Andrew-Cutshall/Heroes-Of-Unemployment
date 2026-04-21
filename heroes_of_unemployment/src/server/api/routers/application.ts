import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "H_o_R/server/api/trpc";
import { z } from "zod";
import {
	XP_REWARDS,
	levelForXp,
	tierForLevel,
	xpProgressInLevel,
	streakBonus,
} from "H_o_R/server/lib/leveling";
import { evaluateBadges, type BadgeCode } from "H_o_R/server/lib/badges";

function isProfileComplete(user: {
	bio: string | null;
	school: string | null;
	major: string | null;
	graduationYear: number | null;
}): boolean {
	return Boolean(user.bio && user.school && user.major && user.graduationYear);
}

export const applicationRouter = createTRPCRouter({
	markAsApplied: protectedProcedure
		.input(z.object({ internshipId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			return ctx.db.$transaction(async (tx) => {
				const internship = await tx.internship.findUnique({
					where: { id: input.internshipId },
					select: { id: true, company: true, daysAgo: true },
				});
				if (!internship) {
					throw new Error("Internship not found");
				}

				await tx.completedApplication.create({
					data: { userId, internshipId: input.internshipId },
				});

				const priorSameCompany = await tx.completedApplication.count({
					where: {
						userId,
						internshipId: { not: input.internshipId },
						internship: { company: internship.company },
					},
				});
				const firstOfCompany = priorSameCompany === 0;

				const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
				const recentApps = await tx.completedApplication.findMany({
					where: { userId, appliedAt: { gte: sevenDaysAgo } },
					select: { appliedAt: true },
				});
				const distinctDays = new Set(
					recentApps.map((a) => a.appliedAt.toISOString().slice(0, 10)),
				);
				const streakDays = distinctDays.size;

				let xpAwarded =
					XP_REWARDS.APPLICATION +
					(firstOfCompany ? XP_REWARDS.FIRST_OF_COMPANY : 0) +
					streakBonus(streakDays);

				const preUser = await tx.user.findUniqueOrThrow({
					where: { id: userId },
					select: {
						xp: true,
						level: true,
						bio: true,
						school: true,
						major: true,
						graduationYear: true,
					},
				});
				const oldLevel = preUser.level;

				const totalApplications = await tx.completedApplication.count({
					where: { userId },
				});
				const companyGroups = await tx.completedApplication.findMany({
					where: { userId },
					select: { internship: { select: { company: true } } },
				});
				const distinctCompanies = new Set(
					companyGroups.map((g) => g.internship.company),
				).size;

				const earnedRows = await tx.userBadge.findMany({
					where: { userId },
					select: { badge: { select: { code: true } } },
				});
				const alreadyEarnedCodes = new Set(
					earnedRows.map((r) => r.badge.code),
				);
				const hadZeroBadges = alreadyEarnedCodes.size === 0;

				const projectedXp = preUser.xp + xpAwarded;
				const projectedLevel = levelForXp(projectedXp);

				const newBadgeCodes: BadgeCode[] = evaluateBadges({
					totalApplications,
					distinctCompanies,
					currentStreakDays: streakDays,
					level: projectedLevel,
					profileComplete: isProfileComplete(preUser),
					appliedToRecentPostingWithin3Days: internship.daysAgo <= 3,
					alreadyEarnedCodes,
				});

				const newBadges = newBadgeCodes.length
					? await tx.badge.findMany({
							where: { code: { in: newBadgeCodes } },
						})
					: [];

				let badgeXp = 0;
				for (const b of newBadges) {
					badgeXp += b.xpReward;
					await tx.userBadge.create({
						data: { userId, badgeId: b.id },
					});
				}
				if (hadZeroBadges && newBadges.length > 0) {
					badgeXp += XP_REWARDS.FIRST_BADGE;
				}
				xpAwarded += badgeXp;

				const finalXp = preUser.xp + xpAwarded;
				const finalLevel = levelForXp(finalXp);

				await tx.user.update({
					where: { id: userId },
					data: { xp: finalXp, level: finalLevel },
				});

				return {
					xp: finalXp,
					level: finalLevel,
					levelUp: finalLevel > oldLevel,
					xpAwarded,
					newBadges: newBadges.map((b) => ({
						code: b.code,
						name: b.name,
						emoji: b.emoji,
						description: b.description,
						tier: b.tier,
					})),
				};
			});
		}),

	getMyApplications: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.completedApplication.findMany({
			where: { userId: ctx.session.user.id },
			include: { internship: true },
			orderBy: { appliedAt: "desc" },
		});
	}),

	getAppliedIds: protectedProcedure.query(async ({ ctx }) => {
		const apps = await ctx.db.completedApplication.findMany({
			where: { userId: ctx.session.user.id },
			select: { internshipId: true },
		});
		return apps.map((a) => a.internshipId);
	}),

	getMyStats: protectedProcedure.query(async ({ ctx }) => {
		const user = await ctx.db.user.findUnique({
			where: { id: ctx.session.user.id },
			select: { xp: true, level: true, name: true, email: true },
		});
		const totalApplications = await ctx.db.completedApplication.count({
			where: { userId: ctx.session.user.id },
		});
		const xp = user?.xp ?? 0;
		const level = user?.level ?? 1;
		return {
			xp,
			level,
			name: user?.name ?? "",
			email: user?.email ?? "",
			totalApplications,
			tier: tierForLevel(level),
			xpProgress: xpProgressInLevel(xp),
		};
	}),

	getLeaderboard: publicProcedure.query(async ({ ctx }) => {
		return ctx.db.user.findMany({
			orderBy: { xp: "desc" },
			take: 50,
			select: {
				id: true,
				name: true,
				xp: true,
				level: true,
				_count: { select: { completedApplications: true } },
			},
		});
	}),
});
