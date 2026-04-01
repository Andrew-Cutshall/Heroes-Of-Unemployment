import { auth } from "H_o_R/server/auth";
import { redirect } from "next/navigation";
import { api } from "H_o_R/trpc/server";
import Link from "next/link";

export const metadata = {
	title: "Profile - Heroes of Unemployment",
	description: "View your Heroes of Unemployment profile",
};

export default async function ProfilePage() {
	const session = await auth();

	// Redirect if not logged in
	if (!session?.user?.id) {
		redirect("/login");
	}

	const userProfile = await api.user.getProfile();
	const stats = await api.user.getStats();
	const recentApps = await api.user.getRecentApplications({ limit: 5 });

	return (
		<div className="space-y-6">
			{/* Profile Header */}
			<div className="rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<h1 className="text-3xl font-bold text-white">
							{userProfile.name}
						</h1>
						<p className="mt-1 text-gray-400">{userProfile.email}</p>

						{userProfile.school && (
							<p className="mt-2 text-gray-300">
								📚 <span className="font-medium">{userProfile.school}</span>
								{userProfile.major && ` • ${userProfile.major}`}
								{userProfile.graduationYear &&
									` • Class of ${userProfile.graduationYear}`}
							</p>
						)}

						{userProfile.bio && (
							<p className="mt-3 max-w-xl text-gray-300">
								{userProfile.bio}
							</p>
						)}

						<div className="mt-4 flex gap-3">
							{userProfile.website && (
								<a
									href={userProfile.website}
									target="_blank"
									rel="noopener noreferrer"
									className="text-purple-400 hover:text-purple-300"
								>
									🔗 Website
								</a>
							)}
							{userProfile.twitterHandle && (
								<a
									href={`https://twitter.com/${userProfile.twitterHandle}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-purple-400 hover:text-purple-300"
								>
									𝕏 @{userProfile.twitterHandle}
								</a>
							)}
						</div>
					</div>

					<Link
						href="/profile/edit"
						className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-2 font-medium text-white transition hover:from-purple-700 hover:to-purple-800"
					>
						Edit Profile
					</Link>
				</div>
			</div>

			{/* Stats Section */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				{/* Level Card */}
				<div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs font-medium uppercase text-gray-400">
								Current Level
							</p>
							<p className="mt-2 text-3xl font-bold text-white">
								Lv. {userProfile.level}
							</p>
						</div>
						<span className="text-4xl">🏆</span>
					</div>
				</div>

				{/* XP Card */}
				<div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
					<div>
						<p className="text-xs font-medium uppercase text-gray-400">
							Total XP
						</p>
						<p className="mt-2 text-3xl font-bold text-white">
							{userProfile.xp.toLocaleString()}
						</p>
						<div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
							<div
								className="h-full rounded-full bg-purple-500"
								style={{
									width: `${((userProfile.xp % 100) / 100) * 100}%`,
								}}
							/>
						</div>
						<p className="mt-1 text-xs text-gray-400">
							{userProfile.xp % 100}/100 to next level
						</p>
					</div>
				</div>

				{/* Applications Card */}
				<div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs font-medium uppercase text-gray-400">
								Applications
							</p>
							<p className="mt-2 text-3xl font-bold text-white">
								{stats.applicationCount}
							</p>
						</div>
						<span className="text-4xl">📋</span>
					</div>
				</div>
			</div>

			{/* Recent Applications */}
			{recentApps.length > 0 && (
				<div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
					<h2 className="mb-4 text-xl font-bold text-white">
						Recent Applications
					</h2>
					<div className="space-y-3">
						{recentApps.map((app) => (
							<div
								key={app.id}
								className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
							>
								<div>
									<p className="font-medium text-white">
										{app.internship.role} at{" "}
										<span className="text-purple-400">
											{app.internship.company}
										</span>
									</p>
									<p className="text-xs text-gray-400">
										{app.internship.location} •{" "}
										{new Date(app.appliedAt).toLocaleDateString()}
									</p>
								</div>
								<span className="text-2xl">✓</span>
							</div>
						))}
					</div>
				</div>
			)}

			{recentApps.length === 0 && (
				<div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
					<p className="text-gray-400">
						No applications yet. Start applying to internships to earn XP!
					</p>
					<Link
						href="/"
						className="mt-4 inline-block rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-2 font-medium text-white transition hover:from-purple-700 hover:to-purple-800"
					>
						Browse Internships
					</Link>
				</div>
			)}
		</div>
	);
}
