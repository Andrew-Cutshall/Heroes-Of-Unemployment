"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { api } from "H_o_R/trpc/react";
import { signOut, useSession } from "next-auth/react";
import {xpProgressInLevel, tierForLevel } from "H_o_R/server/lib/leveling";
import HerosOfUnemploymentLogo from "/images/HerosOfUnemploymentLogo.png";
export function NavBar() {
	const pathname = usePathname();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const { data: session } = useSession();

	const statsQuery = api.application.getMyStats.useQuery(undefined, {
		enabled: !!session?.user,
	});
	const badgesQuery = api.user.getMyBadges.useQuery(undefined, {
		enabled: !!session?.user,
	});

	const xp = statsQuery.data?.xp ?? session?.user?.xp ?? 0;
	const level = statsQuery.data?.level ?? session?.user?.level ?? 1;
	const progress = xpProgressInLevel(xp);
	const tier = tierForLevel(level);
	const latestBadge = badgesQuery.data?.earned[0];

	const handleSignOut = async () => {
		await signOut({ redirect: false });
		router.refresh();
	};

	const linkClass = (active: boolean) =>
		`rpg-display text-base transition ${
			active
				? "text-[#f4c430] drop-shadow-[0_0_6px_rgba(244,196,48,0.6)]"
				: "text-[#cbb9a0] hover:text-[#f4c430]"
		}`;

	const navLinks = (
		<>
			<Link href="/" className={linkClass(pathname === "/")}>
				⚔ Quest Board
			</Link>
			<Link
				href="/leaderboard"
				className={linkClass(pathname === "/leaderboard")}
			>
				🏆 Hall of Heroes
			</Link>
			{session?.user && (
				<Link href="/profile" className={linkClass(pathname === "/profile")}>
					📜 Character
				</Link>
			)}
			{session?.user?.isAdmin && (
				<Link
					href="/admin"
					className={linkClass(pathname.startsWith("/admin"))}
				>
					👑 Dungeon Master
				</Link>
			)}
		</>
	);

	return (
		<nav className="sticky top-0 z-50 border-b border-[#d4af37]/30 bg-[#0a0620]/85 px-4 py-3 backdrop-blur-md md:px-6">
			<div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent" />
			<div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
				<div className="flex items-center gap-6">
					<Link
						href="/"
						className="rpg-heading text-lg drop-shadow-[0_0_8px_rgba(244,196,48,0.4)]"
					>
						<Image
							src="/images/HerosOfUnemploymentLogo.png"
							width={80}
							height={80}
							alt="⚜ Heroes of Unemployment"
							className="rounded-full border border-[#d4af37]/50 shadow-[0_0_10px_rgba(244,196,48,0.3)]"
                        />
					</Link>
					<div className="hidden gap-5 md:flex">{navLinks}</div>
				</div>

				<div className="flex items-center gap-2 md:gap-3">
					{session?.user && (
						<>
							<div className="hidden items-center gap-2 md:flex">
								<span
									className="tier-chip"
									style={{
										backgroundImage: `linear-gradient(180deg, ${tier.color}, ${tier.color}99)`,
										color: "#0b0514",
									}}
									title={`${tier.tier} tier`}
								>
									{tier.emoji} LV{level}
								</span>
								{latestBadge && (
									<span
										className="text-lg rpg-float"
										title={`Latest: ${latestBadge.badge.name}`}
									>
										{latestBadge.badge.emoji}
									</span>
								)}
								<div className="flex items-center gap-1.5">
									<div className="xp-gauge h-2.5 w-28">
										<div
											className="xp-gauge-fill"
											style={{ width: `${progress.pct}%` }}
										/>
									</div>
									<span className="rpg-pixel text-[9px] text-[#f4c430]">
										{progress.current}/{progress.needed}
									</span>
								</div>
							</div>
							<button
								type="button"
								onClick={handleSignOut}
								className="rpg-button hidden rounded-sm px-3 py-1.5 text-xs md:inline-block"
							>
								Flee
							</button>
						</>
					)}
					{!session?.user && (
						<>
							<Link
								href="/login"
								className="rpg-button hidden rounded-sm px-3 py-1.5 text-xs md:inline-block"
							>
								Enter Tavern
							</Link>
							<Link
								href="/register"
								className="rpg-button rpg-button-primary hidden rounded-sm px-3 py-1.5 text-xs md:inline-block"
							>
								Begin Quest
							</Link>
						</>
					)}
					<button
						type="button"
						aria-label="Toggle menu"
						onClick={() => setOpen((v) => !v)}
						className="rounded border border-[#d4af37]/40 p-2 text-[#f4c430] md:hidden"
					>
						{open ? "✕" : "☰"}
					</button>
				</div>
			</div>

			{open && (
				<div className="mt-3 flex flex-col gap-3 border-t border-[#d4af37]/25 pt-3 md:hidden">
					<div className="flex flex-col gap-2">{navLinks}</div>
					{session?.user ? (
						<div className="flex items-center justify-between">
							<span
								className="tier-chip"
								style={{
									backgroundImage: `linear-gradient(180deg, ${tier.color}, ${tier.color}99)`,
									color: "#0b0514",
								}}
							>
								{tier.emoji} LV{level}
							</span>
							<button
								type="button"
								onClick={handleSignOut}
								className="rpg-button rounded-sm px-3 py-1 text-xs"
							>
								Flee
							</button>
						</div>
					) : (
						<div className="flex gap-2">
							<Link
								href="/login"
								className="rpg-button rounded-sm px-3 py-1 text-xs"
							>
								Enter Tavern
							</Link>
							<Link
								href="/register"
								className="rpg-button rpg-button-primary rounded-sm px-3 py-1 text-xs"
							>
								Begin Quest
							</Link>
						</div>
					)}
				</div>
			)}
		</nav>
	);
}
