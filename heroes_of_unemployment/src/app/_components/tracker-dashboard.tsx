"use client";

import { useState } from "react";
import { api } from "H_o_R/trpc/react";

const STATUSES = ["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"] as const;
type Status = (typeof STATUSES)[number];

export function TrackerDashboard() {
	const [filter, setFilter] = useState<Status | "ALL">("ALL");
	const [apps] = api.tracker.getAll.useSuspenseQuery(
		filter === "ALL" ? undefined : { status: filter },
	);

	const utils = api.useUtils();

	const updateStatus = api.tracker.updateStatus.useMutation({
		onSuccess: async () => {
			await utils.tracker.getAll.invalidate();
			await utils.tracker.getStatusMap.invalidate();
		},
	});

	const deleteApp = api.tracker.delete.useMutation({
		onSuccess: async () => {
			await utils.tracker.getAll.invalidate();
			await utils.tracker.getStatusMap.invalidate();
		},
	});

	const tabs = ["ALL", ...STATUSES] as const;

	return (
		<div className="mx-auto w-full max-w-5xl space-y-4">
			<h2 className="text-xl font-bold text-white">
				Application Tracker
			</h2>

			<div className="flex gap-1 overflow-x-auto rounded-lg bg-white/5 p-1">
				{tabs.map((tab) => (
					<button
						key={tab}
						type="button"
						onClick={() => setFilter(tab)}
						className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
							filter === tab
								? "bg-purple-600 text-white"
								: "text-gray-400 hover:text-white"
						}`}
					>
						{tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
					</button>
				))}
			</div>

			{apps.length === 0 ? (
				<p className="py-12 text-center text-gray-500">
					No tracked applications{filter !== "ALL" ? ` with status "${filter.charAt(0) + filter.slice(1).toLowerCase()}"` : ""}.
				</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-white/10 text-gray-400">
								<th className="px-3 py-2 font-medium">Company</th>
								<th className="px-3 py-2 font-medium">Role</th>
								<th className="px-3 py-2 font-medium">Location</th>
								<th className="px-3 py-2 font-medium">Date</th>
								<th className="px-3 py-2 font-medium">Status</th>
								<th className="px-3 py-2 font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{apps.map((app) => (
								<tr
									key={app.id}
									className="border-b border-white/5 transition hover:bg-white/5"
								>
									<td className="px-3 py-2 font-medium text-white">
										{app.company}
									</td>
									<td className="px-3 py-2 text-gray-300">{app.role}</td>
									<td className="px-3 py-2 text-gray-400">{app.location}</td>
									<td className="px-3 py-2 text-gray-400">{app.datePosted}</td>
									<td className="px-3 py-2">
										<select
											value={app.status}
											onChange={(e) =>
												updateStatus.mutate({
													id: app.id,
													status: e.target.value as Status,
												})
											}
											className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-purple-500"
										>
											{STATUSES.map((s) => (
												<option key={s} value={s}>
													{s.charAt(0) + s.slice(1).toLowerCase()}
												</option>
											))}
										</select>
									</td>
									<td className="flex items-center gap-2 px-3 py-2">
										{app.applicationUrl && (
											<a
												href={app.applicationUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-xs text-purple-400 hover:text-purple-300"
											>
												Apply
											</a>
										)}
										<button
											type="button"
											onClick={() => deleteApp.mutate({ id: app.id })}
											className="text-xs text-red-400 hover:text-red-300"
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
