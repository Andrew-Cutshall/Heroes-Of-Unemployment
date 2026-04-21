"use client";

import { api } from "H_o_R/trpc/react";
import { tierForLevel } from "H_o_R/server/lib/leveling";

const RANK_STYLE: Record<number, { color: string; label: string; glow: string }> = {
	1: { color: "#f4c430", label: "👑", glow: "0 0 18px rgba(244,196,48,0.6)" },
	2: { color: "#c0c0c0", label: "🥈", glow: "0 0 14px rgba(200,200,200,0.5)" },
	3: { color: "#cd7f32", label: "🥉", glow: "0 0 12px rgba(205,127,50,0.5)" },
};

export function LeaderboardContent() {
	const [users] = api.application.getLeaderboard.useSuspenseQuery();

	return (
		<div className="space-y-4">
			<div className="rpg-panel rpg-panel-ornate p-6 text-center">
				<h1 className="rpg-heading text-3xl">🏆 Hall of Heroes 🏆</h1>
				<p className="rpg-display mt-2 text-sm text-[#d9c9a6]">
					The mightiest quest-takers in the realm, ranked by deeds and valor.
				</p>
			</div>

			{users.length === 0 ? (
				<div className="rpg-panel p-12 text-center">
					<p className="rpg-display text-[#d9c9a6]">
						No heroes yet. Be the first to enter the pantheon.
					</p>
				</div>
			) : (
				<div className="rpg-panel rpg-panel-ornate overflow-x-auto p-4">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-[#d4af37]/30">
								<th className="rpg-pixel px-4 py-3 text-[9px] text-[#d4af37]">
									#
								</th>
								<th className="rpg-pixel px-4 py-3 text-[9px] text-[#d4af37]">
									HERO
								</th>
								<th className="rpg-pixel px-4 py-3 text-[9px] text-[#d4af37]">
									RANK
								</th>
								<th className="rpg-pixel px-4 py-3 text-[9px] text-[#d4af37]">
									XP
								</th>
								<th className="rpg-pixel px-4 py-3 text-[9px] text-[#d4af37]">
									QUESTS
								</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user, i) => {
								const rank = i + 1;
								const style = RANK_STYLE[rank];
								const tier = tierForLevel(user.level);
								return (
									<tr
										key={user.id}
										className={`border-b border-[#d4af37]/10 transition hover:bg-[#d4af37]/5 ${
											rank <= 3 ? "bg-[#d4af37]/[0.04]" : ""
										}`}
									>
										<td
											className="rpg-display px-4 py-3 text-xl font-bold"
											style={{
												color: style?.color ?? "#8a7a5a",
												textShadow: style?.glow ?? "none",
											}}
										>
											{style ? style.label : rank}
										</td>
										<td className="rpg-display px-4 py-3 font-medium text-[#f5f1e4]">
											{user.name ?? "Nameless Wanderer"}
										</td>
										<td className="px-4 py-3">
											<span
												className="tier-chip"
												style={{
													backgroundImage: `linear-gradient(180deg, ${tier.color}, ${tier.color}99)`,
													color: "#0b0514",
												}}
											>
												{tier.emoji} LV{user.level}
											</span>
										</td>
										<td className="rpg-pixel px-4 py-3 text-[11px] text-[#f4c430]">
											{user.xp.toLocaleString()}
										</td>
										<td className="rpg-pixel px-4 py-3 text-[11px] text-[#d9c9a6]">
											{user._count.completedApplications}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
