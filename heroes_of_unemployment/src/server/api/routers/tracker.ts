import {
	createTRPCRouter,
	protectedProcedure,
} from "H_o_R/server/api/trpc";
import { z } from "zod";

const statusEnum = z.enum([
	"SAVED",
	"APPLIED",
	"INTERVIEW",
	"OFFER",
	"REJECTED",
]);

export const trackerRouter = createTRPCRouter({
	getAll: protectedProcedure
		.input(
			z
				.object({
					status: statusEnum.optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			return ctx.db.trackedApplication.findMany({
				where: {
					userId: ctx.session.user.id,
					...(input?.status ? { status: input.status } : {}),
				},
				orderBy: { updatedAt: "desc" },
			});
		}),

	upsert: protectedProcedure
		.input(
			z.object({
				company: z.string(),
				role: z.string(),
				location: z.string(),
				applicationUrl: z.string(),
				datePosted: z.string(),
				source: z.string(),
				status: statusEnum.default("SAVED"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.trackedApplication.upsert({
				where: {
					userId_company_role_source: {
						userId: ctx.session.user.id,
						company: input.company,
						role: input.role,
						source: input.source,
					},
				},
				create: {
					userId: ctx.session.user.id,
					...input,
				},
				update: {
					status: input.status,
				},
			});
		}),

	updateStatus: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				status: statusEnum,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.trackedApplication.update({
				where: {
					id: input.id,
					userId: ctx.session.user.id,
				},
				data: { status: input.status },
			});
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.trackedApplication.delete({
				where: {
					id: input.id,
					userId: ctx.session.user.id,
				},
			});
		}),

	getStatusMap: protectedProcedure.query(async ({ ctx }) => {
		const apps = await ctx.db.trackedApplication.findMany({
			where: { userId: ctx.session.user.id },
			select: { company: true, role: true, source: true, status: true },
		});

		const map: Record<string, string> = {};
		for (const app of apps) {
			const id = Buffer.from(
				`${app.source}:${app.company}:${app.role}`,
			).toString("base64");
			map[id] = app.status;
		}
		return map;
	}),
});
