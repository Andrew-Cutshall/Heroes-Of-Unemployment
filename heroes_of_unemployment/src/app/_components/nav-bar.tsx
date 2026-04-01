"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface NavBarProps {
	session: {
		user?: {
			id?: string;
			name?: string | null;
			image?: string | null;
			xp?: number;
			level?: number;
		};
	} | null;
}

export function NavBar({ session }: NavBarProps) {
	const router = useRouter();
	const xp = session?.user?.xp ?? 0;
	const level = session?.user?.level ?? 1;
	const xpInLevel = xp % 100;

	const handleSignOut = async () => {
		await signOut({ redirect: false });
		router.push("/");
	};

	return (
		<nav className="sticky top-0 z-50 border-b border-white/10 bg-[#15162c]/90 px-6 py-3 backdrop-blur-sm">
			<div className="mx-auto flex max-w-5xl items-center justify-between">
				<Link href="/" className="text-lg font-bold text-white">
					Heroes of Unemployment
				</Link>

				<div className="flex items-center gap-4">
					{session?.user && (
						<>
							<div className="flex items-center gap-2">
								<span className="rounded bg-purple-600 px-2 py-0.5 text-xs font-bold text-white">
									Lv.{level}
								</span>
								<div className="flex items-center gap-1.5">
									<div className="h-2 w-20 overflow-hidden rounded-full bg-white/10">
										<div
											className="h-full rounded-full bg-purple-500 transition-all duration-500"
											style={{ width: `${xpInLevel}%` }}
										/>
									</div>
									<span className="text-xs text-gray-400">
										{xp} XP
									</span>
								</div>
							</div>
							{session.user.image && (
								<img
									src={session.user.image}
									alt=""
									className="h-7 w-7 rounded-full"
								/>
							)}
							<span className="text-sm text-gray-300">
								{session.user.name}
							</span>
							<Link
								href="/profile"
								className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
							>
								Profile
							</Link>
							<button
								onClick={handleSignOut}
								className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
							>
								Sign out
							</button>
						</>
					)}
					{!session?.user && (
						<>
							<Link
								href="/login"
								className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
							>
								Sign in
							</Link>
							<Link
								href="/register"
								className="rounded-full bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-1.5 text-sm font-medium text-white transition hover:from-purple-700 hover:to-purple-800"
							>
								Register
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}
