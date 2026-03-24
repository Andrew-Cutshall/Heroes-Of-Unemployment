"use client";

interface SearchBarProps {
	search: string;
	onSearchChange: (value: string) => void;
	locationFilter: string;
	onLocationFilterChange: (value: string) => void;
	sourceFilter: string;
	onSourceFilterChange: (value: string) => void;
	hideClosed: boolean;
	onHideClosedChange: (value: boolean) => void;
	sources: string[];
}

export function SearchBar({
	search,
	onSearchChange,
	locationFilter,
	onLocationFilterChange,
	sourceFilter,
	onSourceFilterChange,
	hideClosed,
	onHideClosedChange,
	sources,
}: SearchBarProps) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			<input
				type="text"
				placeholder="Search company or role..."
				value={search}
				onChange={(e) => onSearchChange(e.target.value)}
				className="min-w-[200px] flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500"
			/>
			<input
				type="text"
				placeholder="Filter by location..."
				value={locationFilter}
				onChange={(e) => onLocationFilterChange(e.target.value)}
				className="w-[180px] rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500"
			/>
			<select
				value={sourceFilter}
				onChange={(e) => onSourceFilterChange(e.target.value)}
				className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
			>
				<option value="">All Sources</option>
				{sources.map((src) => (
					<option key={src} value={src}>
						{src}
					</option>
				))}
			</select>
			<label className="flex items-center gap-1.5 text-sm text-gray-400">
				<input
					type="checkbox"
					checked={hideClosed}
					onChange={(e) => onHideClosedChange(e.target.checked)}
					className="rounded border-white/10"
				/>
				Hide closed
			</label>
		</div>
	);
}
