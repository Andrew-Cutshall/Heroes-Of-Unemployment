import { createTRPCRouter, adminProcedure } from "H_o_R/server/api/trpc";
import { z } from "zod";

export const analyticsRouter = createTRPCRouter({
	overview: adminProcedure.query(async ({ ctx }) => {
		const todayStart = new Date();
		todayStart.setHours(0, 0, 0, 0);

		const [totalUsers, totalInternships, totalApplications, activeToday] =
			await Promise.all([
				ctx.db.user.count(),
				ctx.db.internship.count(),
				ctx.db.completedApplication.count(),
				ctx.db.completedApplication
					.findMany({
						where: { appliedAt: { gte: todayStart } },
						select: { userId: true },
						distinct: ["userId"],
					})
					.then((rows) => rows.length),
			]);

		return { totalUsers, totalInternships, totalApplications, activeToday };
	}),

	applicationsPerDay: adminProcedure
		.input(z.object({ days: z.number().min(1).max(365).default(30) }))
		.query(async ({ ctx, input }) => {
			const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
			const rows = await ctx.db.completedApplication.findMany({
				where: { appliedAt: { gte: since } },
				select: { appliedAt: true },
			});
			const buckets = new Map<string, number>();
			for (let i = 0; i < input.days; i++) {
				const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
				buckets.set(d.toISOString().slice(0, 10), 0);
			}
			for (const r of rows) {
				const key = r.appliedAt.toISOString().slice(0, 10);
				buckets.set(key, (buckets.get(key) ?? 0) + 1);
			}
			return Array.from(buckets.entries())
				.map(([date, count]) => ({ date, count }))
				.sort((a, b) => a.date.localeCompare(b.date));
		}),

	topCompanies: adminProcedure
		.input(z.object({ limit: z.number().min(1).max(50).default(10) }))
		.query(async ({ ctx, input }) => {
			const rows = await ctx.db.completedApplication.findMany({
				select: { internship: { select: { company: true } } },
			});
			const counts = new Map<string, number>();
			for (const r of rows) {
				const c = r.internship.company;
				counts.set(c, (counts.get(c) ?? 0) + 1);
			}
			return Array.from(counts.entries())
				.map(([company, applications]) => ({ company, applications }))
				.sort((a, b) => b.applications - a.applications)
				.slice(0, input.limit);
		}),

	userGrowth: adminProcedure
		.input(z.object({ days: z.number().min(1).max(365).default(30) }))
		.query(async ({ ctx, input }) => {
			const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
			const users = await ctx.db.user.findMany({
				select: { createdAt: true },
				orderBy: { createdAt: "asc" },
			});
			const priorCount = users.filter((u) => u.createdAt < since).length;
			const buckets = new Map<string, number>();
			for (let i = 0; i < input.days; i++) {
				const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
				buckets.set(d.toISOString().slice(0, 10), 0);
			}
			for (const u of users) {
				if (u.createdAt < since) continue;
				const key = u.createdAt.toISOString().slice(0, 10);
				buckets.set(key, (buckets.get(key) ?? 0) + 1);
			}
			let running = priorCount;
			return Array.from(buckets.entries())
				.sort((a, b) => a[0].localeCompare(b[0]))
				.map(([date, newToday]) => {
					running += newToday;
					return { date, cumulativeUsers: running };
				});
		}),

	levelDistribution: adminProcedure.query(async ({ ctx }) => {
		const users = await ctx.db.user.findMany({ select: { level: true } });
		const counts = new Map<number, number>();
		for (const u of users) {
			counts.set(u.level, (counts.get(u.level) ?? 0) + 1);
		}
		return Array.from(counts.entries())
			.map(([level, users]) => ({ level, users }))
			.sort((a, b) => a.level - b.level);
	}),
});
