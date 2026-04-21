import { AdminInternshipsTable } from "H_o_R/app/_components/admin-internships-table";

export default function AdminInternshipsPage() {
	return (
		<div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
			<h1 className="mb-4 text-xl font-bold text-white">Internship Deadlines</h1>
			<p className="mb-4 text-sm text-gray-400">
				Set or clear application deadlines. Internships with deadlines appear
				in the deadline sort order on the feed.
			</p>
			<AdminInternshipsTable />
		</div>
	);
}
