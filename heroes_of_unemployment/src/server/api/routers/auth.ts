import { createTRPCRouter, publicProcedure } from "H_o_R/server/api/trpc";
import { signUpSchema } from "H_o_R/server/lib/auth-schemas";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

export const authRouter = createTRPCRouter({
	signUp: publicProcedure.input(signUpSchema).mutation(async ({ ctx, input }) => {
		const existing = await ctx.db.user.findUnique({
			where: { email: input.email },
		});
		if (existing) {
			throw new TRPCError({
				code: "CONFLICT",
				message: "Email already in use",
			});
		}

		const hashedPassword = await bcrypt.hash(input.password, 10);

		await ctx.db.user.create({
			data: {
				name: input.name,
				email: input.email,
				password: hashedPassword,
			},
		});

		return { success: true };
	}),
});
