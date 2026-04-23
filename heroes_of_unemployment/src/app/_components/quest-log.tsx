"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "H_o_R/trpc/react";
import {
	APPLICATION_STATUSES,
	type ApplicationStatus,
} from "H_o_R/server/lib/leveling";

const STATUS_CONFIG: Record<
	ApplicationStatus,
	{ label: string; emoji: string; className: string }
> = {
	APPLIED:      { label: "Applied",      emoji: "📜", className: "bg-amber-900/40 text-amber-300 border-amber-700/40" },
	PHONE_SCREEN: { label: "Phone Screen", emoji: "📞", className: "bg-blue-900/40 text-blue-300 border-blue-700/40" },
	INTERVIEW:    { label: "Interview",    emoji: "⚔️",  className: "bg-purple-900/40 text-purple-300 border-purple-700/40" },
	FINAL_ROUND:  { label: "Final Round",  emoji: "🔥", className: "bg-orange-900/40 text-orange-300 border-orange-700/40" },
	OFFER:        { label: "Offer",        emoji: "🏆", className: "bg-green-900/40 text-green-300 border-green-700/40" },
	REJECTED:     { label: "Rejected",     emoji: "💀", className: "bg-red-900/40 text-red-400 border-red-700/40" },
	GHOSTED:      { label: "Ghosted",      emoji: "👻", className: "bg-slate-900/40 text-slate-400 border-slate-700/40" },
};

interface AppRowProps {
	app: {
		id: string;
		status: string;
		appliedAt: Date;
		internship: { company: string; role: string; location: string };
	};
}

function AppRow({ app }: AppRowProps) {
	const [xpFlash, setXpFlash] = useState<number | null>(null);
	const utils = api.useUtils();

	const updateStatus = api.application.updateStatus.useMutation({
		onSuccess: (result) => {
			void utils.application.getMyApplications.invalidate();
			void utils.application.getMyStats.invalidate();
			void utils.user.getMyBadges.invalidate();
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
		<div className="rpg-scroll flex flex-wrap items-center justify-between gap-3 p-3">
			<div className="min-w-0 flex-1">
				<p className="rpg-display font-medium text-[#f5f1e4]">
					{app.internship.role} at{" "}
					<span className="text-[#f4c430]">{app.internship.company}</span>
				</p>
				<p className="rpg-pixel mt-0.5 text-[9px] text-[#8a7a5a]">
					{app.internship.location} · {new Date(app.appliedAt).toLocaleDateString()}
				</p>
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
					className="rounded border border-[#d4af37]/30 bg-black/50 px-2 py-1 text-xs text-[#d9c9a6] focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 disabled:opacity-50"
				>
					{APPLICATION_STATUSES.map((s) => (
						<option key={s} value={s}>
							{STATUS_CONFIG[s].emoji} {STATUS_CONFIG[s].label}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}

export function QuestLog() {
	const [applications] = api.application.getMyApplications.useSuspenseQuery();

	if (applications.length === 0) {
		return (
			<div className="rpg-panel rpg-panel-ornate p-8 text-center">
				<p className="text-4xl">📋</p>
				<p className="rpg-heading mt-3 text-xl">Your ledger is empty</p>
				<p className="rpg-display mt-2 text-sm text-[#8a7a5a]">
					Claim a quest from the board to begin your legend.
				</p>
				<a href="/" className="rpg-button mt-4 inline-block rounded-sm px-5 py-2 text-sm">
					To the Quest Board
				</a>
			</div>
		);
	}

	return (
		<div className="rpg-panel rpg-panel-ornate p-6">
			<h2 className="rpg-heading mb-3 text-xl">⚔️ Quest Log</h2>
			<div className="rpg-divider mb-4" />
			<div className="space-y-2">
				{applications.map((app) => (
					<AppRow key={app.id} app={app} />
				))}
			</div>
		</div>
	);
}
