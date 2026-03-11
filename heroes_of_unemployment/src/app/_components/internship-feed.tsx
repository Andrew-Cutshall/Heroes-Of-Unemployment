"use client";

import { useMemo, useState } from "react";
import { api } from "H_o_R/trpc/react";
import { InternshipCard } from "./internship-card";
import { SearchBar } from "./search-bar";

export function InternshipFeed({ isLoggedIn }: { isLoggedIn: boolean }) {
	const [internships] = api.internship.getAll.useSuspenseQuery();
	const statusMapQuery = api.tracker.getStatusMap.useQuery(undefined, {
		enabled: isLoggedIn,
	});

	const [search, setSearch] = useState("");
	const [locationFilter, setLocationFilter] = useState("");
	const [sourceFilter, setSourceFilter] = useState("");

	const locations = useMemo(() => {
		const locs = new Set<string>();
		for (const i of internships) {
			if (i.location) locs.add(i.location);
		}
		return Array.from(locs).sort();
	}, [internships]);

	const sources = useMemo(() => {
		const srcs = new Set<string>();
		for (const i of internships) {
			srcs.add(i.source);
		}
		return Array.from(srcs).sort();
	}, [internships]);

	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		return internships.filter((i) => {
			if (q && !i.company.toLowerCase().includes(q) && !i.role.toLowerCase().includes(q)) {
				return false;
			}
			if (locationFilter && i.location !== locationFilter) return false;
			if (sourceFilter && i.source !== sourceFilter) return false;
			return true;
		});
	}, [internships, search, locationFilter, sourceFilter]);

	const statusMap = statusMapQuery.data ?? {};

	return (
		<div className="mx-auto w-full max-w-4xl space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-bold text-white">
					Internship Listings
				</h2>
				<span className="text-sm text-gray-400">
					{filtered.length} of {internships.length} listings
				</span>
			</div>
			<SearchBar
				search={search}
				onSearchChange={setSearch}
				locationFilter={locationFilter}
				onLocationFilterChange={setLocationFilter}
				sourceFilter={sourceFilter}
				onSourceFilterChange={setSourceFilter}
				locations={locations}
				sources={sources}
			/>
			<div className="space-y-2">
				{filtered.length === 0 ? (
					<p className="py-8 text-center text-gray-500">
						No internships found matching your filters.
					</p>
				) : (
					filtered.map((internship) => (
						<InternshipCard
							key={internship.id}
							internship={internship}
							currentStatus={statusMap[internship.id]}
							isLoggedIn={isLoggedIn}
						/>
					))
				)}
			</div>
		</div>
	);
}
