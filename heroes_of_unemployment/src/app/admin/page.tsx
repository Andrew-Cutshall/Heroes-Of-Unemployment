import { api } from "H_o_R/trpc/server";
import { StatCard } from "H_o_R/app/_components/admin/stat-card";
import { BarChart } from "H_o_R/app/_components/admin/bar-chart";
import { LineChart } from "H_o_R/app/_components/admin/line-chart";

export default async function AdminOverviewPage() {
	const [overview, perDay, topCompanies, growth, levels] = await Promise.all([
		api.analytics.overview(),
		api.analytics.applicationsPerDay({ days: 30 }),
		api.analytics.topCompanies({ limit: 10 }),
		api.analytics.userGrowth({ days: 30 }),
		api.analytics.levelDistribution(),
	]);

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				<StatCard label="Users" value={overview.totalUsers} icon="👤" />
				<StatCard
					label="Internships"
					value={overview.totalInternships}
					icon="💼"
				/>
				<StatCard
					label="Applications"
					value={overview.totalApplications}
					icon="📨"
				/>
				<StatCard
					label="Active today"
					value={overview.activeToday}
					icon="🔥"
				/>
			</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<BarChart
					title="Applications per day (last 30)"
					data={perDay}
					xKey="date"
					yKey="count"
					color="#a855f7"
				/>
				<BarChart
					title="Top companies"
					data={topCompanies}
					xKey="company"
					yKey="applications"
					color="#22c55e"
				/>
				<LineChart
					title="User growth (cumulative)"
					data={growth}
					xKey="date"
					yKey="cumulativeUsers"
					color="#60a5fa"
				/>
				<BarChart
					title="Level distribution"
					data={levels}
					xKey="level"
					yKey="users"
					color="#fbbf24"
				/>
			</div>
		</div>
	);
}
