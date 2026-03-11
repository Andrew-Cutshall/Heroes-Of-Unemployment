import { auth } from "H_o_R/server/auth";
import { api, HydrateClient } from "H_o_R/trpc/server";
import { redirect } from "next/navigation";
import { TrackerDashboard } from "H_o_R/app/_components/tracker-dashboard";

export default async function TrackerPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/api/auth/signin");
	}

	void api.tracker.getAll.prefetch();

	return (
		<HydrateClient>
			<div className="px-4 py-8">
				<TrackerDashboard />
			</div>
		</HydrateClient>
	);
}
