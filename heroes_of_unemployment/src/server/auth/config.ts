import { db } from "H_o_R/server/db";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			xp: number;
			level: number;
			isAdmin: boolean;
			bio?: string;
			website?: string;
			twitterHandle?: string;
			school?: string;
			major?: string;
			graduationYear?: number | null;
		} & DefaultSession["user"];
	}
	interface User {
		xp?: number;
		level?: number;
		isAdmin?: boolean;
		bio?: string;
		website?: string;
		twitterHandle?: string;
		school?: string;
		major?: string;
		graduationYear?: number | null;
	}
}

export const authConfig = {
    session: { strategy: "jwt" },
	pages: { signIn: "/login" },

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
					xp: user.xp,
					level: user.level,
					isAdmin: user.isAdmin,
					bio: user.bio ?? undefined,
					website: user.website ?? undefined,
					twitterHandle: user.twitterHandle ?? undefined,
					school: user.school ?? undefined,
					major: user.major ?? undefined,
					graduationYear: user.graduationYear,
				};
			},
		}),
	],
	callbacks: {
		jwt: async ({ token, user }) => {
			if (user) {
				token.id = user.id;
				token.xp = user.xp;
				token.level = user.level;
				token.isAdmin = user.isAdmin;
				token.bio = user.bio;
				token.website = user.website;
				token.twitterHandle = user.twitterHandle;
				token.school = user.school;
				token.major = user.major;
				token.graduationYear = user.graduationYear;
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
					level: token.level as number,
					isAdmin: (token.isAdmin as boolean) ?? false,
				},
			};
		},
	},
	secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
