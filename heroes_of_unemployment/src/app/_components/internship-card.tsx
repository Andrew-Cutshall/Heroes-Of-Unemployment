"use client";

import { api } from "H_o_R/trpc/react";

const STATUSES = ["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"] as const;

interface InternshipCardProps {
	internship: {
		id: string;
		company: string;
		role: string;
		location: string;
		applicationUrl: string;
		datePosted: string;
		source: string;
		badges: string[];
	};
	currentStatus?: string;
	isLoggedIn: boolean;
}

export function InternshipCard({
	internship,
	currentStatus,
	isLoggedIn,
}: InternshipCardProps) {
	const utils = api.useUtils();

	const upsert = api.tracker.upsert.useMutation({
		onSuccess: async () => {
			await utils.tracker.getStatusMap.invalidate();
		},
	});

	const handleStatusChange = (status: string) => {
		upsert.mutate({
			company: internship.company,
			role: internship.role,
			location: internship.location,
			applicationUrl: internship.applicationUrl,
			datePosted: internship.datePosted,
			source: internship.source,
			status: status as (typeof STATUSES)[number],
		});
	};

	return (
		<div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/[0.08]">
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<span className="font-semibold text-white">
						{internship.company}
					</span>
					{internship.badges.map((badge) => (
						<span
							key={badge}
							className="rounded bg-purple-500/20 px-1.5 py-0.5 text-xs text-purple-300"
						>
							{badge}
						</span>
					))}
				</div>
				<p className="text-sm text-gray-300">{internship.role}</p>
				<div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
					<span>{internship.location}</span>
					{internship.datePosted && (
						<>
							<span>|</span>
							<span>{internship.datePosted}</span>
						</>
					)}
					<span>|</span>
					<span>{internship.source}</span>
				</div>
			</div>
			<div className="flex shrink-0 items-center gap-2">
				{isLoggedIn && (
					<select
						value={currentStatus ?? ""}
						onChange={(e) => handleStatusChange(e.target.value)}
						className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-purple-500"
					>
						<option value="">Track...</option>
						{STATUSES.map((s) => (
							<option key={s} value={s}>
								{s.charAt(0) + s.slice(1).toLowerCase()}
							</option>
						))}
					</select>
				)}
				{internship.applicationUrl && (
					<a
						href={internship.applicationUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-purple-500"
					>
						Apply
					</a>
				)}
			</div>
		</div>
	);
}
