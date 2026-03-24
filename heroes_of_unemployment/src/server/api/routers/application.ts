import { createTRPCRouter, protectedProcedure } from "H_o_R/server/api/trpc";
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
});
