import {
	createTRPCRouter,
	publicProcedure,
	adminProcedure,
} from "H_o_R/server/api/trpc";
import { z } from "zod";

export const internshipRouter = createTRPCRouter({
	getAll: publicProcedure
		.input(
			z
				.object({
					search: z.string().max(100).optional(),
					location: z.string().max(100).optional(),
					source: z.string().optional(),
					categorySlug: z.string().optional(),
					hideClosed: z.boolean().optional(),
					sortBy: z.enum(["recent", "deadline"]).optional(),
					cursor: z.string().optional(),
					limit: z.number().min(1).max(100).default(50),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const limit = input?.limit ?? 50;
			const where = {
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
				...(input?.categorySlug
					? { category: { slug: input.categorySlug } }
					: {}),
				...(input?.hideClosed ? { isClosed: false } : {}),
			};

			const orderBy =
				input?.sortBy === "deadline"
					? [{ deadline: { sort: "asc" as const, nulls: "last" as const } }]
					: [{ daysAgo: "asc" as const }];

			const items = await ctx.db.internship.findMany({
				where,
				orderBy,
				take: limit + 1,
				...(input?.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
				include: { category: true },
			});

			let nextCursor: string | null = null;
			if (items.length > limit) {
				const next = items.pop();
				nextCursor = next?.id ?? null;
			}
			return { items, nextCursor };
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

	updateDeadline: adminProcedure
		.input(
			z.object({
				id: z.string(),
				deadline: z.date().nullable(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.internship.update({
				where: { id: input.id },
				data: { deadline: input.deadline },
			});
		}),

	adminList: adminProcedure
		.input(
			z.object({
				search: z.string().optional(),
				limit: z.number().default(100),
				offset: z.number().default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			const where = input.search
				? {
						OR: [
							{ company: { contains: input.search } },
							{ role: { contains: input.search } },
						],
					}
				: {};
			const [items, total] = await Promise.all([
				ctx.db.internship.findMany({
					where,
					orderBy: { daysAgo: "asc" },
					skip: input.offset,
					take: input.limit,
					include: { category: true },
				}),
				ctx.db.internship.count({ where }),
			]);
			return { items, total };
		}),
});
