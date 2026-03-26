import { db } from "H_o_R/server/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

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
	// Use credential-based auth (email + password stored in the database).
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			authorize: async (credentials) => {
				if (!credentials?.email || !credentials?.password) return null;

				const user = await db.user.findUnique({ where: { email: credentials.email } });
				if (!user || !user.password) return null;

				const valid = await bcrypt.compare(credentials.password, user.password);
				if (!valid) return null;

				// Return minimal user object - NextAuth will handle session creation via the adapter
				return {
					id: user.id,
					name: user.name ?? undefined,
					email: user.email ?? undefined,
					image: user.image ?? undefined,
				};
			},
		}),
	],
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
	// Ensure a secret is provided via environment (AUTH_SECRET)
	secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
