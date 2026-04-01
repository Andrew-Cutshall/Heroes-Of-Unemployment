import { auth } from "H_o_R/server/auth";
import { api, HydrateClient } from "H_o_R/trpc/server";
import { redirect } from "next/navigation";
import { ProfileContent } from "H_o_R/app/_components/profile-content";
import { Suspense } from "react";

export default async function ProfilePage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/signin");
	}

	void api.application.getMyStats.prefetch();
	void api.application.getMyApplications.prefetch();

	return (
		<HydrateClient>
			<Suspense
				fallback={
					<div className="flex justify-center py-20">
						<p className="text-gray-400">Loading profile...</p>
					</div>
				}
			>
				<ProfileContent />
			</Suspense>
		</HydrateClient>
	);
}
