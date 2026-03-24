import { createTRPCRouter, publicProcedure } from "H_o_R/server/api/trpc";
import { z } from "zod";

export const internshipRouter = createTRPCRouter({
	getAll: publicProcedure
		.input(
			z
				.object({
					search: z.string().optional(),
					location: z.string().optional(),
					source: z.string().optional(),
					hideClosed: z.boolean().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			return ctx.db.internship.findMany({
				where: {
					...(input?.search
						? {
								OR: [
									{ company: { contains: input.search } },
									{ role: { contains: input.search } },
								],
							}
						: {}),
					...(input?.location
					? { location: { contains: input.location } }
					: {}),
					...(input?.source ? { source: input.source } : {}),
					...(input?.hideClosed ? { isClosed: false } : {}),
				},
				orderBy: { daysAgo: "asc" },
			});
		}),

	getFilters: publicProcedure.query(async ({ ctx }) => {
		const sources = await ctx.db.internship.findMany({
			select: { source: true },
			distinct: ["source"],
			orderBy: { source: "asc" },
		});
		return {
			sources: sources.map((s) => s.source),
		};
	}),
});
