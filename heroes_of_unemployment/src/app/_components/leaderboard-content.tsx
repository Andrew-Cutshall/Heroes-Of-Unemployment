"use client";

import { api } from "H_o_R/trpc/react";

const RANK_COLORS: Record<number, string> = {
	1: "text-yellow-400",
	2: "text-gray-300",
	3: "text-amber-600",
};

export function LeaderboardContent() {
	const [users] = api.application.getLeaderboard.useSuspenseQuery();

	return (
		<div>
			<h1 className="mb-6 text-xl font-bold text-white">Leaderboard</h1>
			{users.length === 0 ? (
				<p className="py-12 text-center text-gray-500">
					No users yet. Be the first to sign up and earn XP!
				</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-white/10 text-gray-400">
								<th className="px-4 py-3 font-medium">#</th>
								<th className="px-4 py-3 font-medium">Name</th>
								<th className="px-4 py-3 font-medium">Level</th>
								<th className="px-4 py-3 font-medium">XP</th>
								<th className="px-4 py-3 font-medium">Applications</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user, i) => {
								const rank = i + 1;
								const rankColor = RANK_COLORS[rank] ?? "text-gray-500";
								return (
									<tr
										key={user.id}
										className={`border-b border-white/5 transition hover:bg-white/5 ${rank <= 3 ? "bg-white/[0.03]" : ""}`}
									>
										<td className={`px-4 py-3 font-bold ${rankColor}`}>
											{rank}
										</td>
										<td className="px-4 py-3 font-medium text-white">
											{user.name ?? "Anonymous"}
										</td>
										<td className="px-4 py-3">
											<span className="rounded bg-purple-600 px-2 py-0.5 text-xs font-bold text-white">
												Lv.{user.level}
											</span>
										</td>
										<td className="px-4 py-3 text-gray-300">
											{user.xp}
										</td>
										<td className="px-4 py-3 text-gray-400">
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
