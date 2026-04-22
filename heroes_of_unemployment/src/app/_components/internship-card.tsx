"use client";

import { useState } from "react";
import { toast } from "sonner";
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
		deadline?: Date | string | null;
		category?: {
			id: string;
			name: string;
			slug: string;
			color: string;
		} | null;
	};
	isApplied: boolean;
	isLoggedIn: boolean;
}

function daysUntil(date: Date | string): number {
	const d = typeof date === "string" ? new Date(date) : date;
	const ms = d.getTime() - Date.now();
	return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export function InternshipCard({
	internship,
	isApplied,
	isLoggedIn,
}: InternshipCardProps) {
	const [xpFlash, setXpFlash] = useState<number | null>(null);
	const [isPenalized, setIsPenalized] = useState(false);
	const [penaltyVal, setPenaltyVal] = useState<number>(0);
	const [hasOpenedLink, setHasOpenedLink] = useState(false);
	const utils = api.useUtils();

	const markAsApplied = api.application.markAsApplied.useMutation({
		onSuccess: (result) => {
			void utils.application.getAppliedIds.invalidate();
			void utils.application.getMyStats.invalidate();
			void utils.user.getMyBadges.invalidate();
			setXpFlash(result.xpAwarded);
			setTimeout(() => setXpFlash(null), 1500);

			if (result.levelUp) {
				toast.custom(() => (
					<div className="rpg-panel rpg-panel-ornate relative overflow-hidden p-4 text-white">
						<p className="rpg-heading text-lg">⚜ Level Up! ⚜</p>
						<p className="rpg-display text-sm text-[#d9c9a6]">
							You have ascended to level {result.level}.
						</p>
						{["#fbbf24", "#60a5fa", "#f87171", "#34d399", "#a78bfa"].map(
							(c, i) => (
								<span
									key={c}
									className="confetti-piece"
									style={{
										left: `${10 + i * 18}%`,
										backgroundColor: c,
										animationDelay: `${i * 0.08}s`,
									}}
								/>
							),
						)}
					</div>
				));
			}
			for (const b of result.newBadges) {
				toast.success(`${b.emoji} ${b.name}`, { description: b.description });
			}
		},
		onError: (error) => {
			const [value, message] = error.message.split("|");
			toast.error(message);
			const numVal = value ? parseInt(value) : 25;
            setIsPenalized(true); //Penalty Trigger
			setPenaltyVal(numVal); // Amount lost
			setTimeout(() => {
				setIsPenalized(false);
				setHasOpenedLink(false);}, 800);
			void utils.application.getMyStats.invalidate();
		},
	});

	const daysLeft = internship.deadline ? daysUntil(internship.deadline) : null;
	const urgent = daysLeft !== null && daysLeft >= 0 && daysLeft < 3;
	const overdue = daysLeft !== null && daysLeft < 0;

	return (
		<div
			className={`rpg-scroll group relative flex items-center gap-4 overflow-hidden px-4 py-3 transition ${
				urgent ? "border-[#dc2626]/70" : ""
			}`}
		>
			{urgent && <div className="rpg-ribbon">URGENT</div>}
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<span className="rpg-display text-base font-semibold text-[#f4e4bc]">
						{internship.company}
					</span>
					<span className="rpg-pixel rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-[#d4af37]">
						{internship.source}
					</span>
					{internship.category && (
						<span
							className="rpg-display rounded px-2 py-0.5 text-xs font-medium text-white"
							style={{
								backgroundColor: `${internship.category.color}33`,
								border: `1px solid ${internship.category.color}99`,
							}}
						>
							{internship.category.name}
						</span>
					)}
					{internship.isClosed && (
						<span className="rpg-pixel rounded bg-red-900/40 px-1.5 py-0.5 text-[9px] text-red-300">
							SEALED
						</span>
					)}
					{daysLeft !== null && !overdue && (
						<span
							className={`rpg-pixel rounded px-1.5 py-0.5 text-[9px] ${
								urgent
									? "bg-red-900/60 text-red-200"
									: "bg-amber-900/40 text-amber-300"
							}`}
						>
							⏱ {daysLeft}D LEFT
						</span>
					)}
					{overdue && (
						<span className="rpg-pixel rounded bg-gray-800/60 px-1.5 py-0.5 text-[9px] text-gray-400">
							EXPIRED
						</span>
					)}
				</div>
				<p className="mt-1 text-sm text-[#d9c9a6]">{internship.role}</p>
				<div className="mt-1 flex items-center gap-3 text-xs text-[#8a7a5a]">
					<span>📍 {internship.location}</span>
					{internship.datePosted && (
						<>
							<span>·</span>
							<span>📆 {internship.datePosted}</span>
						</>
					)}
				</div>
			</div>
			<div className="flex shrink-0 items-center gap-2">
				{xpFlash !== null && (
					<span className="rpg-pixel animate-bounce text-xs font-bold text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]">
						+{xpFlash} XP
					</span>
				)}

				{isPenalized && (
					<span className="rpg-pixel animate-bounce text-xs font-bold text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]">
						-{penaltyVal} XP
					</span>
				)}
				{isLoggedIn &&
					(isApplied ? (
						<span className="rpg-pixel rounded border border-[#10b981]/60 bg-[#10b981]/15 px-3 py-1.5 text-[10px] text-[#6ee7b7]">
							✓ CLAIMED
						</span>
				) : !hasOpenedLink ? (
						internship.applicationUrl && (
							<a
								href={internship.applicationUrl}
								target="_blank"
								rel="noopener noreferrer"
								onClick={() => setHasOpenedLink(true)}
								className="rpg-button rpg-button-primary rounded-sm px-3 py-1.5 text-xs"
							>
								Begin Quest
							</a>
						) 
					) : (
							<div className={`flex items-center gap-2 transition-all duration-300 ${isPenalized ? "scale-95" : "scale-100"}`}>
								<button
									type="button"
									onClick={() => markAsApplied.mutate({ internshipId: internship.id })}
									disabled={markAsApplied.isPending || internship.isClosed || isPenalized}
									className={`rpg-button rounded-sm px-3 py-1.5 text-xs transition-all ${isPenalized
											? "border-red-600 bg-red-900/40 text-red-400 animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.8)]"
											: "text-[#10b981] border-[#10b981]/50 hover:bg-[#10b981]/10"
										}`}
								>
									{markAsApplied.isPending ? "…" : isPenalized ? "TRAPPED!" : "Confirm Applied"}
								</button>
								{!isPenalized && (
									<button
										type="button"
										onClick={() => setHasOpenedLink(false)}
										className="text-[10px] text-[#8a7a5a] hover:text-[#d9c9a6] underline"
									>
										Cancel
									</button>
								)}
							</div>
					))}
				{internship.applicationUrl && (
					<a
						href={internship.applicationUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="rpg-button rpg-button-primary rounded-sm px-3 py-1.5 text-xs"
					>
						⚔ Apply
					</a>
				)}
			</div>
		</div>
	);
}
