"use client";

type SortBy = "recent" | "deadline";

interface CategoryOption {
	id: string;
	slug: string;
	name: string;
	color: string;
}

interface SearchBarProps {
	search: string;
	onSearchChange: (value: string) => void;
	locationFilter: string;
	onLocationFilterChange: (value: string) => void;
	sourceFilter: string;
	onSourceFilterChange: (value: string) => void;
	categorySlug: string;
	onCategorySlugChange: (value: string) => void;
	hideClosed: boolean;
	onHideClosedChange: (value: boolean) => void;
	sortBy: SortBy;
	onSortByChange: (value: SortBy) => void;
	sources: string[];
	categories: CategoryOption[];
}

export function SearchBar({
	search,
	onSearchChange,
	locationFilter,
	onLocationFilterChange,
	sourceFilter,
	onSourceFilterChange,
	categorySlug,
	onCategorySlugChange,
	hideClosed,
	onHideClosedChange,
	sortBy,
	onSortByChange,
	sources,
	categories,
}: SearchBarProps) {
	return (
		<div className="rpg-panel flex flex-wrap items-center gap-3 p-3">
			<input
				type="text"
				placeholder="🔍 Seek a guild or title…"
				value={search}
				onChange={(e) => onSearchChange(e.target.value)}
				className="rpg-input min-w-[200px] flex-1 rounded-sm px-4 py-2 text-sm placeholder-[#8a7a5a]"
			/>
			<input
				type="text"
				placeholder="🏰 Realm…"
				value={locationFilter}
				onChange={(e) => onLocationFilterChange(e.target.value)}
				className="rpg-input w-[160px] rounded-sm px-4 py-2 text-sm placeholder-[#8a7a5a]"
			/>
			<select
				value={sourceFilter}
				onChange={(e) => onSourceFilterChange(e.target.value)}
				className="rpg-input rounded-sm px-3 py-2 text-sm"
			>
				<option value="">All Scribes</option>
				{sources.map((src) => (
					<option key={src} value={src}>
						{src}
					</option>
				))}
			</select>
			<select
				value={categorySlug}
				onChange={(e) => onCategorySlugChange(e.target.value)}
				className="rpg-input rounded-sm px-3 py-2 text-sm"
			>
				<option value="">All Classes</option>
				{categories.map((c) => (
					<option key={c.id} value={c.slug}>
						{c.name}
					</option>
				))}
			</select>
			<select
				value={sortBy}
				onChange={(e) => onSortByChange(e.target.value as SortBy)}
				className="rpg-input rounded-sm px-3 py-2 text-sm"
			>
				<option value="recent">Order: Newest</option>
				<option value="deadline">Order: Deadline</option>
			</select>
			<label className="rpg-display flex items-center gap-1.5 text-sm text-[#d9c9a6]">
				<input
					type="checkbox"
					checked={hideClosed}
					onChange={(e) => onHideClosedChange(e.target.checked)}
					className="rounded border-[#d4af37]/40 accent-[#d4af37]"
				/>
				Hide sealed
			</label>
		</div>
	);
}
