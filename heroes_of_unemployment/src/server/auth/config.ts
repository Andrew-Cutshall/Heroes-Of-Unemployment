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
	interface User {
		xp?: number;
        level?: number;
	}
}

export const authConfig = {
	//Change for credientials provider, as this is based on email and password
    session: { strategy: "jwt"}, //Web token to store session data

	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			authorize: async (credentials) => {
				const email = credentials?.email as string | undefined;
				const password = credentials?.password as string | undefined;
				if (!email || !password) return null;
				const user = await db.user.findUnique({ where: { email } });
				if (!user || !user.password) return null;
				const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) return null;
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
		jwt: async ({ token, user }) => {
			if (user) {
				token.id = user.id;
				token.xp = user.xp;
				token.level = user.level;
			}
			return token;
		},
		session: async ({ session, token }) => {
			return {
				...session,
				user: {
					...session.user,
					id: token.id as string,
					xp: token.xp as number,
				},
			};
		},
	},
	// Ensure a secret is provided via environment (AUTH_SECRET)
	secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
