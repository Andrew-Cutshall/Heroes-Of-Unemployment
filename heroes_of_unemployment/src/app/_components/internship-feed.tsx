"use client";

import { useState, useMemo, useEffect } from "react";
import { api } from "H_o_R/trpc/react";
import { InternshipCard } from "./internship-card";
import { SearchBar } from "./search-bar";

export function InternshipFeed({ isLoggedIn }: { isLoggedIn: boolean }) {
	const [search, setSearch] = useState("");
	const [locationFilter, setLocationFilter] = useState("");
	const [sourceFilter, setSourceFilter] = useState("");
	const [hideClosed, setHideClosed] = useState(false);

	const debouncedSearch = useDebounce(search, 300);
	const debouncedLocation = useDebounce(locationFilter, 300);

	const [internships] = api.internship.getAll.useSuspenseQuery({
		search: debouncedSearch || undefined,
		location: debouncedLocation || undefined,
		source: sourceFilter || undefined,
		hideClosed: hideClosed || undefined,
	});

	const [filters] = api.internship.getFilters.useSuspenseQuery();

	const appliedIdsQuery = api.application.getAppliedIds.useQuery(undefined, {
		enabled: isLoggedIn,
	});

	const appliedSet = useMemo(
		() => new Set(appliedIdsQuery.data ?? []),
		[appliedIdsQuery.data],
	);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">
					Internship Listings
				</h1>
				<span className="text-sm text-gray-400">
					{internships.length} listings
				</span>
			</div>
			<SearchBar
				search={search}
				onSearchChange={setSearch}
				locationFilter={locationFilter}
				onLocationFilterChange={setLocationFilter}
				sourceFilter={sourceFilter}
				onSourceFilterChange={setSourceFilter}
				hideClosed={hideClosed}
				onHideClosedChange={setHideClosed}
				sources={filters.sources}
			/>
			<div className="space-y-2">
				{internships.length === 0 ? (
					<p className="py-8 text-center text-gray-500">
						No internships found matching your filters.
					</p>
				) : (
					internships.map((internship) => (
						<InternshipCard
							key={internship.id}
							internship={internship}
							isApplied={appliedSet.has(internship.id)}
							isLoggedIn={isLoggedIn}
						/>
					))
				)}
			</div>
		</div>
	);
}

function useDebounce(value: string, delay: number): string {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debounced;
}
