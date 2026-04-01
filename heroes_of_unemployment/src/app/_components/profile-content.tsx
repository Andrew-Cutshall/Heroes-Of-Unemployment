"use client";

import { api } from "H_o_R/trpc/react";

export function ProfileContent() {
	const [stats] = api.application.getMyStats.useSuspenseQuery();
	const [applications] = api.application.getMyApplications.useSuspenseQuery();

	const xpInLevel = stats.xp % 100;

	return (
		<div className="space-y-8">
			<div className="rounded-lg border border-white/10 bg-white/5 p-6">
				<h1 className="mb-4 text-2xl font-bold text-white">{stats.name}</h1>
				<p className="mb-6 text-sm text-gray-400">{stats.email}</p>

				<div className="grid grid-cols-3 gap-4">
					<div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
						<span className="text-3xl font-bold text-purple-400">
							{stats.level}
						</span>
						<p className="mt-1 text-xs text-gray-400">Level</p>
					</div>
					<div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
						<span className="text-3xl font-bold text-purple-400">
							{stats.xp}
						</span>
						<p className="mt-1 text-xs text-gray-400">Total XP</p>
					</div>
					<div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
						<span className="text-3xl font-bold text-purple-400">
							{stats.totalApplications}
						</span>
						<p className="mt-1 text-xs text-gray-400">Applications</p>
					</div>
				</div>

				<div className="mt-4">
					<div className="mb-1 flex justify-between text-xs text-gray-400">
						<span>Level {stats.level}</span>
						<span>{xpInLevel}/100 XP to next level</span>
					</div>
					<div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
						<div
							className="h-full rounded-full bg-purple-500 transition-all duration-500"
							style={{ width: `${xpInLevel}%` }}
						/>
					</div>
				</div>
			</div>

			<div>
				<h2 className="mb-3 text-lg font-bold text-white">
					Application History
				</h2>
				{applications.length === 0 ? (
					<p className="py-8 text-center text-gray-500">
						No applications yet. Start applying from the feed!
					</p>
				) : (
					<div className="space-y-2">
						{applications.map((app) => (
							<div
								key={app.id}
								className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
							>
								<div>
									<span className="font-medium text-white">
										{app.internship.company}
									</span>
									<p className="text-sm text-gray-300">
										{app.internship.role}
									</p>
								</div>
								<span className="text-xs text-gray-500">
									{new Date(app.appliedAt).toLocaleDateString()}
								</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
