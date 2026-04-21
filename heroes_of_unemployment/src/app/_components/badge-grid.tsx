interface BadgeLike {
	id: string;
	code: string;
	name: string;
	description: string;
	emoji: string;
	xpReward: number;
	tier: string;
}

interface EarnedBadge {
	id: string;
	earnedAt: Date;
	badge: BadgeLike;
}

interface BadgeGridProps {
	earned: EarnedBadge[];
	all: BadgeLike[];
}

const TIER_LABEL: Record<string, string> = {
	bronze: "COMMON",
	silver: "RARE",
	gold: "LEGENDARY",
};

const TIER_TEXT: Record<string, string> = {
	bronze: "text-[#cd7f32]",
	silver: "text-[#c0c0c0]",
	gold: "text-[#f4c430]",
};

export function BadgeGrid({ earned, all }: BadgeGridProps) {
	const earnedByCode = new Map(earned.map((e) => [e.badge.code, e]));

	return (
		<div className="rpg-panel rpg-panel-ornate p-6">
			<div className="mb-4 flex items-baseline justify-between">
				<h2 className="rpg-heading text-xl">⚜ Trophies & Relics</h2>
				<span className="rpg-pixel text-[10px] text-[#d4af37]">
					{earned.length}/{all.length} UNSEALED
				</span>
			</div>
			<div className="rpg-divider mb-6" />
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{all.map((badge) => {
					const earnedEntry = earnedByCode.get(badge.code);
					const isEarned = Boolean(earnedEntry);
					const tierClass = TIER_TEXT[badge.tier] ?? TIER_TEXT.bronze;
					return (
						<div
							key={badge.code}
							className={`rpg-badge-tile ${badge.tier} ${
								isEarned ? "earned" : "opacity-40 grayscale"
							} p-3 text-center`}
							title={badge.description}
						>
							<div className="relative text-4xl drop-shadow-[0_0_8px_rgba(244,196,48,0.3)]">
								{badge.emoji}
							</div>
							<p className="rpg-display relative mt-1 text-xs font-semibold text-[#f5f1e4]">
								{badge.name}
							</p>
							<p className={`rpg-pixel relative mt-1 text-[8px] ${tierClass}`}>
								{TIER_LABEL[badge.tier] ?? "COMMON"}
							</p>
							<p className="rpg-pixel relative mt-0.5 text-[8px] text-[#8a7a5a]">
								+{badge.xpReward} XP
							</p>
							{isEarned && earnedEntry && (
								<p className="rpg-pixel relative mt-1 text-[8px] text-[#a78bfa]">
									{new Date(earnedEntry.earnedAt).toLocaleDateString()}
								</p>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
