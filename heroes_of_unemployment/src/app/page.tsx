import { auth } from "H_o_R/server/auth";
import { api, HydrateClient } from "H_o_R/trpc/server";
import { InternshipFeed } from "H_o_R/app/_components/internship-feed";
import { Suspense } from "react";

export default async function Home() {
	const session = await auth();

	void api.internship.getAll.prefetch();
	void api.internship.getFilters.prefetch();

	return (
		<HydrateClient>
			<Suspense
				fallback={
					<div className="flex justify-center py-20">
						<p className="text-gray-400">Loading internships...</p>
					</div>
				}
			>
				<InternshipFeed isLoggedIn={!!session?.user} />
			</Suspense>
		</HydrateClient>
	);
}
