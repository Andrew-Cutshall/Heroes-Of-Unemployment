import { auth } from "H_o_R/server/auth";
import { api } from "H_o_R/trpc/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
	xpProgressInLevel,
	tierForLevel,
} from "H_o_R/server/lib/leveling";
import { BadgeGrid } from "H_o_R/app/_components/badge-grid";
import { EmptyState } from "H_o_R/app/_components/empty-state";

export const metadata = {
	title: "Character Sheet - Heroes of Unemployment",
	description: "Your character sheet in the realm of Heroes of Unemployment",
};

export default async function ProfilePage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/login");
	}

	const userProfile = await api.user.getProfile();
	const stats = await api.user.getStats();
	const recentApps = await api.user.getRecentApplications({ limit: 5 });
	const badges = await api.user.getMyBadges();
	const tier = tierForLevel(userProfile.level);
	const progress = xpProgressInLevel(userProfile.xp);

	return (
		<div className="space-y-6">
			<div className="rpg-panel rpg-panel-ornate p-8">
				<p className="rpg-pixel mb-3 text-[10px] text-[#d4af37]">
					✦ CHARACTER SHEET ✦
				</p>
				<div className="flex flex-col items-start justify-between gap-4 md:flex-row">
					<div className="flex-1">
						<h1 className="rpg-heading text-4xl">{userProfile.name}</h1>
						<p className="rpg-pixel mt-1 text-[10px] text-[#8a7a5a]">
							{userProfile.email}
						</p>

						{userProfile.school && (
							<p className="mt-3 text-sm text-[#d9c9a6]">
								📚 <span className="rpg-display font-medium">{userProfile.school}</span>
								{userProfile.major && ` · ${userProfile.major}`}
								{userProfile.graduationYear &&
									` · Class of ${userProfile.graduationYear}`}
							</p>
						)}

						{userProfile.bio && (
							<p className="mt-3 max-w-xl text-sm italic text-[#c6b696]">
								"{userProfile.bio}"
							</p>
						)}

						<div className="mt-4 flex gap-3">
							{userProfile.website && (
								<a
									href={userProfile.website}
									target="_blank"
									rel="noopener noreferrer"
									className="rpg-display text-sm text-[#f4c430] hover:text-[#fff0a8]"
								>
									🔗 Tome
								</a>
							)}
							{userProfile.twitterHandle && (
								<a
									href={`https://twitter.com/${userProfile.twitterHandle}`}
									target="_blank"
									rel="noopener noreferrer"
									className="rpg-display text-sm text-[#f4c430] hover:text-[#fff0a8]"
								>
									𝕏 @{userProfile.twitterHandle}
								</a>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<Link
							href="/profile/edit"
							className="rpg-button rpg-button-primary rounded-sm px-6 py-2 text-center text-sm"
						>
							Edit Lorebook
						</Link>
						<a
							href="/api/applications/export"
							download
							className="rpg-button rounded-sm px-6 py-2 text-center text-sm"
						>
							📥 Export Ledger
						</a>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div className="rpg-panel rpg-panel-ornate p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="rpg-pixel text-[9px] text-[#d4af37]">TIER</p>
							<p
								className="rpg-heading mt-2 text-3xl"
								style={{ color: tier.color }}
							>
								{tier.tier}
							</p>
							<p className="rpg-pixel mt-1 text-[10px] text-[#d9c9a6]">
								LEVEL {userProfile.level}
							</p>
						</div>
						<span className="text-5xl rpg-float">{tier.emoji}</span>
					</div>
				</div>

				<div className="rpg-panel rpg-panel-ornate p-6">
					<p className="rpg-pixel text-[9px] text-[#d4af37]">EXPERIENCE</p>
					<p className="rpg-heading mt-2 text-3xl">
						{userProfile.xp.toLocaleString()}
					</p>
					<div className="xp-gauge mt-3 h-3">
						<div
							className="xp-gauge-fill"
							style={{ width: `${progress.pct}%` }}
						/>
					</div>
					<p className="rpg-pixel mt-2 text-[9px] text-[#8a7a5a]">
						{progress.current}/{progress.needed} TO NEXT RANK
					</p>
				</div>

				<div className="rpg-panel rpg-panel-ornate p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="rpg-pixel text-[9px] text-[#d4af37]">QUESTS COMPLETED</p>
							<p className="rpg-heading mt-2 text-3xl">
								{stats.applicationCount}
							</p>
						</div>
						<span className="text-5xl rpg-float">⚔️</span>
					</div>
				</div>
			</div>

			<BadgeGrid earned={badges.earned} all={badges.all} />

			{recentApps.length > 0 && (
				<div className="rpg-panel rpg-panel-ornate p-6">
					<h2 className="rpg-heading mb-3 text-xl">📜 Recent Deeds</h2>
					<div className="rpg-divider mb-4" />
					<div className="space-y-3">
						{recentApps.map((app) => (
							<div
								key={app.id}
								className="rpg-scroll flex items-center justify-between p-3"
							>
								<div>
									<p className="rpg-display font-medium text-[#f5f1e4]">
										{app.internship.role} at{" "}
										<span className="text-[#f4c430]">
											{app.internship.company}
										</span>
									</p>
									<p className="rpg-pixel mt-0.5 text-[9px] text-[#8a7a5a]">
										{app.internship.location} ·{" "}
										{new Date(app.appliedAt).toLocaleDateString()}
									</p>
								</div>
								<span className="text-2xl text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]">
									✓
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{recentApps.length === 0 && (
				<EmptyState
					emoji="📋"
					title="Your ledger is empty"
					flavor="Claim a quest from the board to begin your legend."
					cta={{ href: "/", label: "To the Quest Board" }}
				/>
			)}
		</div>
	);
}
