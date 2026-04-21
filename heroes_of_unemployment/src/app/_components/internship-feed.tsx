"use client";

import { useState, useMemo, useEffect } from "react";
import { api } from "H_o_R/trpc/react";
import { InternshipCard } from "./internship-card";
import { SearchBar } from "./search-bar";
import { EmptyState } from "./empty-state";

type SortBy = "recent" | "deadline";

export function InternshipFeed({ isLoggedIn }: { isLoggedIn: boolean }) {
	const [search, setSearch] = useState("");
	const [locationFilter, setLocationFilter] = useState("");
	const [sourceFilter, setSourceFilter] = useState("");
	const [categorySlug, setCategorySlug] = useState("");
	const [hideClosed, setHideClosed] = useState(false);
	const [sortBy, setSortBy] = useState<SortBy>("recent");

	const debouncedSearch = useDebounce(search, 300);
	const debouncedLocation = useDebounce(locationFilter, 300);

	const feedQuery = api.internship.getAll.useInfiniteQuery(
		{
			search: debouncedSearch || undefined,
			location: debouncedLocation || undefined,
			source: sourceFilter || undefined,
			categorySlug: categorySlug || undefined,
			hideClosed: hideClosed || undefined,
			sortBy,
			limit: 50,
		},
		{
			getNextPageParam: (last) => last.nextCursor ?? undefined,
		},
	);

	const internships = useMemo(
		() => feedQuery.data?.pages.flatMap((p) => p.items) ?? [],
		[feedQuery.data],
	);

	const filtersQuery = api.internship.getFilters.useQuery();
	const categoriesQuery = api.category.list.useQuery();

	const appliedIdsQuery = api.application.getAppliedIds.useQuery(undefined, {
		enabled: isLoggedIn,
	});

	const appliedSet = useMemo(
		() => new Set(appliedIdsQuery.data ?? []),
		[appliedIdsQuery.data],
	);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-2">
				<h2 className="rpg-heading text-2xl">📜 Quest Board</h2>
				<span className="rpg-pixel text-[10px] text-[#d4af37]">
					{internships.length} QUEST{internships.length === 1 ? "" : "S"} AVAILABLE
				</span>
			</div>
			<SearchBar
				search={search}
				onSearchChange={setSearch}
				locationFilter={locationFilter}
				onLocationFilterChange={setLocationFilter}
				sourceFilter={sourceFilter}
				onSourceFilterChange={setSourceFilter}
				categorySlug={categorySlug}
				onCategorySlugChange={setCategorySlug}
				hideClosed={hideClosed}
				onHideClosedChange={setHideClosed}
				sortBy={sortBy}
				onSortByChange={setSortBy}
				sources={filtersQuery.data?.sources ?? []}
				categories={categoriesQuery.data ?? []}
			/>
			<div className="space-y-2">
				{feedQuery.isLoading ? (
					<p className="rpg-display py-8 text-center text-[#d9c9a6]">
						✦ Consulting the ancient tomes…
					</p>
				) : internships.length === 0 ? (
					<EmptyState
						emoji="🔍"
						title="No quests match your filters"
						flavor="The scrolls are silent. Try broadening your search."
					/>
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
			{feedQuery.hasNextPage && (
				<div className="flex justify-center pt-2">
					<button
						type="button"
						onClick={() => feedQuery.fetchNextPage()}
						disabled={feedQuery.isFetchingNextPage}
						className="rpg-button rounded-sm px-6 py-2 text-sm disabled:opacity-50"
					>
						{feedQuery.isFetchingNextPage ? "Summoning…" : "Unfurl More Scrolls"}
					</button>
				</div>
			)}
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
