import { db } from "H_o_R/server/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			xp: number;
			level: number;
		} & DefaultSession["user"];
	}
}

export const authConfig = {
	providers: [GitHubProvider],
	adapter: PrismaAdapter(db),
	callbacks: {
		session: async ({ session, user }) => {
			const dbUser = await db.user.findUnique({
				where: { id: user.id },
				select: { xp: true, level: true },
			});
			return {
				...session,
				user: {
					...session.user,
					id: user.id,
					xp: dbUser?.xp ?? 0,
					level: dbUser?.level ?? 1,
				},
			};
		},
	},
} satisfies NextAuthConfig;
