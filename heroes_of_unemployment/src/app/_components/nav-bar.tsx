"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavBar({
	session,
}: {
	session: { user?: { name?: string | null; image?: string | null } } | null;
}) {
	const pathname = usePathname();

	return (
		<nav className="sticky top-0 z-50 border-b border-white/10 bg-[#15162c]/90 px-6 py-3 backdrop-blur-sm">
			<div className="mx-auto flex max-w-7xl items-center justify-between">
				<div className="flex items-center gap-8">
					<Link
						href="/"
						className="text-lg font-bold text-white"
					>
						Heroes of Unemployment
					</Link>
					<div className="flex gap-4">
						<Link
							href="/"
							className={`text-sm transition ${pathname === "/" ? "text-purple-400" : "text-gray-400 hover:text-white"}`}
						>
							Feed
						</Link>
						<Link
							href="/tracker"
							className={`text-sm transition ${pathname === "/tracker" ? "text-purple-400" : "text-gray-400 hover:text-white"}`}
						>
							Tracker
						</Link>
					</div>
				</div>
				<div className="flex items-center gap-3">
					{session?.user && (
						<div className="flex items-center gap-2">
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
						</div>
					)}
					<Link
						href={session ? "/api/auth/signout" : "/api/auth/signin"}
						className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
					>
						{session ? "Sign out" : "Sign in"}
					</Link>
				</div>
			</div>
		</nav>
	);
}
