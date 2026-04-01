import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "H_o_R/server/api/trpc";
import { z } from "zod";
import {
	XP_PER_APPLICATION,
	calculateLevel,
} from "H_o_R/server/lib/parse-internships";

export const applicationRouter = createTRPCRouter({
	markAsApplied: protectedProcedure
		.input(z.object({ internshipId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			await ctx.db.completedApplication.create({
				data: {
					userId,
					internshipId: input.internshipId,
				},
			});

			const user = await ctx.db.user.update({
				where: { id: userId },
				data: {
					xp: { increment: XP_PER_APPLICATION },
				},
			});

			const newLevel = calculateLevel(user.xp);
			if (newLevel !== user.level) {
				await ctx.db.user.update({
					where: { id: userId },
					data: { level: newLevel },
				});
			}

			return { xp: user.xp, level: newLevel };
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
		return {
			xp: user?.xp ?? 0,
			level: user?.level ?? 1,
			name: user?.name ?? "",
			email: user?.email ?? "",
			totalApplications,
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
