import {
	createTRPCRouter,
	publicProcedure,
	adminProcedure,
} from "H_o_R/server/api/trpc";
import { z } from "zod";

const slugSchema = z
	.string()
	.min(1)
	.max(40)
	.regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, digits, or hyphens");

const colorSchema = z
	.string()
	.regex(/^#[0-9a-fA-F]{6}$/, "color must be a #rrggbb hex string");

export const categoryRouter = createTRPCRouter({
	list: publicProcedure.query(async ({ ctx }) => {
		return ctx.db.category.findMany({ orderBy: { name: "asc" } });
	}),

	create: adminProcedure
		.input(
			z.object({
				name: z.string().min(1).max(60),
				slug: slugSchema,
				color: colorSchema.optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.category.create({ data: input });
		}),

	update: adminProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).max(60).optional(),
				slug: slugSchema.optional(),
				color: colorSchema.optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;
			return ctx.db.category.update({ where: { id }, data });
		}),

	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.category.delete({ where: { id: input.id } });
		}),

	assign: adminProcedure
		.input(
			z.object({
				internshipId: z.string(),
				categoryId: z.string().nullable(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.db.internship.update({
				where: { id: input.internshipId },
				data: { categoryId: input.categoryId },
			});
		}),
});
