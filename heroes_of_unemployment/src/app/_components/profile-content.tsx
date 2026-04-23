"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "H_o_R/trpc/react";
import { APPLICATION_STATUSES, type ApplicationStatus } from "H_o_R/server/lib/leveling";

const STATUS_CONFIG: Record<
	ApplicationStatus,
	{ label: string; emoji: string; className: string }
> = {
	APPLIED:      { label: "Applied",      emoji: "📜", className: "bg-amber-900/40 text-amber-300 border-amber-700/40" },
	PHONE_SCREEN: { label: "Phone Screen", emoji: "📞", className: "bg-blue-900/40 text-blue-300 border-blue-700/40" },
	INTERVIEW:    { label: "Interview",    emoji: "⚔️", className: "bg-purple-900/40 text-purple-300 border-purple-700/40" },
	FINAL_ROUND:  { label: "Final Round",  emoji: "🔥", className: "bg-orange-900/40 text-orange-300 border-orange-700/40" },
	OFFER:        { label: "Offer",        emoji: "🏆", className: "bg-green-900/40 text-green-300 border-green-700/40" },
	REJECTED:     { label: "Rejected",     emoji: "💀", className: "bg-red-900/40 text-red-400 border-red-700/40" },
	GHOSTED:      { label: "Ghosted",      emoji: "👻", className: "bg-slate-900/40 text-slate-400 border-slate-700/40" },
};

interface ApplicationRowProps {
	app: {
		id: string;
		status: string;
		appliedAt: Date;
		internship: { company: string; role: string };
	};
}

function ApplicationRow({ app }: ApplicationRowProps) {
	const [xpFlash, setXpFlash] = useState<number | null>(null);
	const utils = api.useUtils();

	const updateStatus = api.application.updateStatus.useMutation({
		onSuccess: (result) => {
			void utils.application.getMyApplications.invalidate();
			void utils.application.getMyStats.invalidate();
			if (result.xpAwarded > 0) {
				setXpFlash(result.xpAwarded);
				setTimeout(() => setXpFlash(null), 1500);
			}
			if (result.levelUp) {
				toast.success(`⚜ Level Up! You ascended to level ${result.level}.`);
			}
			for (const b of result.newBadges) {
				toast.success(`${b.emoji} ${b.name}`, { description: b.description });
			}
		},
	});

	const currentStatus = (app.status ?? "APPLIED") as ApplicationStatus;
	const config = STATUS_CONFIG[currentStatus];

	return (
		<div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 gap-3">
			<div className="min-w-0 flex-1">
				<span className="font-medium text-white">{app.internship.company}</span>
				<p className="text-sm text-gray-300">{app.internship.role}</p>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				{xpFlash !== null && (
					<span className="rpg-pixel animate-bounce text-xs font-bold text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]">
						+{xpFlash} XP
					</span>
				)}

				<span
					className={`rpg-pixel rounded border px-2 py-0.5 text-[10px] ${config.className}`}
				>
					{config.emoji} {config.label}
				</span>

				<select
					value={currentStatus}
					disabled={updateStatus.isPending}
					onChange={(e) =>
						updateStatus.mutate({
							applicationId: app.id,
							status: e.target.value as ApplicationStatus,
						})
					}
					className="rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
				>
					{APPLICATION_STATUSES.map((s) => (
						<option key={s} value={s}>
							{STATUS_CONFIG[s].emoji} {STATUS_CONFIG[s].label}
						</option>
					))}
				</select>

				<span className="text-xs text-gray-500">
					{new Date(app.appliedAt).toLocaleDateString()}
				</span>
			</div>
		</div>
	);
}

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
							<ApplicationRow key={app.id} app={app} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
