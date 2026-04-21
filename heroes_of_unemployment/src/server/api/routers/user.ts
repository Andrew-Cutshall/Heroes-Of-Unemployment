import { createTRPCRouter, publicProcedure, protectedProcedure } from "H_o_R/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import {
	registerInputSchema,
	updateProfileInputSchema,
	checkEmailSchema,
} from "H_o_R/server/lib/validators";

export const userRouter = createTRPCRouter({
	register: publicProcedure
		.input(registerInputSchema)
		.mutation(async ({ ctx, input }) => {
			const { email, password, name } = input;

			const existingUser = await ctx.db.user.findUnique({
				where: { email },
			});

			if (existingUser) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Email already in use",
				});
			}

			const hashedPassword = await bcrypt.hash(password, 10);

			const user = await ctx.db.user.create({
				data: {
					email,
					password: hashedPassword,
					name: name ?? email.split("@")[0],
				},
			});

			return {
				id: user.id,
				email: user.email,
				name: user.name,
			};
		}),

	checkEmailExists: publicProcedure
		.input(checkEmailSchema)
		.query(async ({ ctx, input }) => {
			const user = await ctx.db.user.findUnique({
				where: { email: input.email },
			});

			return {
				exists: !!user,
			};
		}),

	getProfile: protectedProcedure.query(async ({ ctx }) => {
		const user = await ctx.db.user.findUnique({
			where: { id: ctx.session.user.id },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				bio: true,
				website: true,
				twitterHandle: true,
				school: true,
				major: true,
				graduationYear: true,
				xp: true,
				level: true,
				createdAt: true,
			},
		});

		if (!user) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "User not found",
			});
		}

		return user;
	}),

	updateProfile: protectedProcedure
		.input(updateProfileInputSchema)
		.mutation(async ({ ctx, input }) => {
			const updateData = Object.fromEntries(
				Object.entries(input).filter(([, value]) => value !== undefined),
			);

			const user = await ctx.db.user.update({
				where: { id: ctx.session.user.id },
				data: updateData,
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
					bio: true,
					website: true,
					twitterHandle: true,
					school: true,
					major: true,
					graduationYear: true,
					xp: true,
					level: true,
				},
			});

			const complete = Boolean(
				user.bio && user.school && user.major && user.graduationYear,
			);
			if (complete) {
				const badge = await ctx.db.badge.findUnique({
					where: { code: "PROFILE_COMPLETE" },
				});
				if (badge) {
					const already = await ctx.db.userBadge.findUnique({
						where: {
							userId_badgeId: {
								userId: ctx.session.user.id,
								badgeId: badge.id,
							},
						},
					});
					if (!already) {
						await ctx.db.userBadge.create({
							data: {
								userId: ctx.session.user.id,
								badgeId: badge.id,
							},
						});
						await ctx.db.user.update({
							where: { id: ctx.session.user.id },
							data: { xp: { increment: badge.xpReward } },
						});
					}
				}
			}

			return user;
		}),

	getMyBadges: protectedProcedure.query(async ({ ctx }) => {
		const [earned, all] = await Promise.all([
			ctx.db.userBadge.findMany({
				where: { userId: ctx.session.user.id },
				include: { badge: true },
				orderBy: { earnedAt: "desc" },
			}),
			ctx.db.badge.findMany({ orderBy: { xpReward: "asc" } }),
		]);
		return { earned, all };
	}),

	getStats: protectedProcedure.query(async ({ ctx }) => {
		const user = await ctx.db.user.findUnique({
			where: { id: ctx.session.user.id },
			select: {
				xp: true,
				level: true,
			},
		});

		const applicationCount = await ctx.db.completedApplication.count({
			where: { userId: ctx.session.user.id },
		});

		return {
			xp: user?.xp ?? 0,
			level: user?.level ?? 1,
			applicationCount,
		};
	}),

	getRecentApplications: protectedProcedure
		.input(
			z.object({
				limit: z.number().default(5),
			})
		)
		.query(async ({ ctx, input }) => {
			return ctx.db.completedApplication.findMany({
				where: { userId: ctx.session.user.id },
				include: {
					internship: {
						select: {
							id: true,
							company: true,
							role: true,
							location: true,
						},
					},
				},
				orderBy: { appliedAt: "desc" },
				take: input.limit,
			});
		}),
});
