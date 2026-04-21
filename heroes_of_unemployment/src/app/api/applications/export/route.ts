import { auth } from "H_o_R/server/auth";
import { db } from "H_o_R/server/db";
import { toCsv } from "H_o_R/server/lib/csv";

export async function GET() {
	const session = await auth();
	if (!session?.user?.id) {
		return new Response("Unauthorized", { status: 401 });
	}

	const rows = await db.completedApplication.findMany({
		where: { userId: session.user.id },
		include: {
			internship: { include: { category: true } },
		},
		orderBy: { appliedAt: "desc" },
	});

	const csv = toCsv(rows, [
		{ header: "Applied At", key: (r) => r.appliedAt.toISOString() },
		{ header: "Company", key: (r) => r.internship.company },
		{ header: "Role", key: (r) => r.internship.role },
		{ header: "Location", key: (r) => r.internship.location },
		{ header: "Source", key: (r) => r.internship.source },
		{ header: "Category", key: (r) => r.internship.category?.name ?? "" },
		{
			header: "Deadline",
			key: (r) =>
				r.internship.deadline
					? r.internship.deadline.toISOString().slice(0, 10)
					: "",
		},
		{ header: "Application URL", key: (r) => r.internship.applicationUrl },
	]);

	return new Response(csv, {
		headers: {
			"Content-Type": "text/csv; charset=utf-8",
			"Content-Disposition": `attachment; filename="applications-${Date.now()}.csv"`,
		},
	});
}
