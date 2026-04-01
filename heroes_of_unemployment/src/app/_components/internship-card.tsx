"use client";

import { useState } from "react";
import { api } from "H_o_R/trpc/react";

interface InternshipCardProps {
	internship: {
		id: string;
		company: string;
		role: string;
		location: string;
		applicationUrl: string;
		datePosted: string;
		source: string;
		isClosed: boolean;
	};
	isApplied: boolean;
	isLoggedIn: boolean;
}

export function InternshipCard({
	internship,
	isApplied,
	isLoggedIn,
}: InternshipCardProps) {
	const [xpFlash, setXpFlash] = useState(false);
	const utils = api.useUtils();

	const markAsApplied = api.application.markAsApplied.useMutation({
		onSuccess: () => {
			void utils.application.getAppliedIds.invalidate();
			void utils.application.getMyStats.invalidate();
			setXpFlash(true);
			setTimeout(() => setXpFlash(false), 1500);
		},
	});

	return (
		<div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/[0.08]">
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<span className="font-semibold text-white">
						{internship.company}
					</span>
					<span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-gray-400">
						{internship.source}
					</span>
					{internship.isClosed && (
						<span className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-400">
							Closed
						</span>
					)}
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
				</div>
			</div>
			<div className="flex shrink-0 items-center gap-2">
				{xpFlash && (
					<span className="animate-bounce text-sm font-bold text-green-400">
						+10 XP
					</span>
				)}
				{isLoggedIn && (
					isApplied ? (
						<span className="rounded-lg bg-green-600/20 px-3 py-1.5 text-xs font-medium text-green-400">
							Applied
						</span>
					) : (
						<button
							type="button"
							onClick={() =>
								markAsApplied.mutate({
									internshipId: internship.id,
								})
							}
							disabled={
								markAsApplied.isPending || internship.isClosed
							}
							className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-500 disabled:opacity-50"
						>
							{markAsApplied.isPending
								? "..."
								: "Mark as Applied"}
						</button>
					)
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
