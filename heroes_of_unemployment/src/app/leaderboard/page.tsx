import { api, HydrateClient } from "H_o_R/trpc/server";
import { LeaderboardContent } from "H_o_R/app/_components/leaderboard-content";
import { Suspense } from "react";

export default async function LeaderboardPage() {
	void api.application.getLeaderboard.prefetch();

	return (
		<HydrateClient>
			<Suspense
				fallback={
					<div className="flex justify-center py-20">
						<p className="text-gray-400">Loading leaderboard...</p>
					</div>
				}
			>
				<LeaderboardContent />
			</Suspense>
		</HydrateClient>
	);
}
