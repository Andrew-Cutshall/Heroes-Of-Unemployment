import { auth } from "H_o_R/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
	title: "Admin - Heroes of Unemployment",
};

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();
	if (!session?.user?.isAdmin) {
		redirect("/");
	}

	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
				<div className="flex items-center gap-4 text-sm">
					<span className="font-bold text-purple-300">Admin</span>
					<Link
						href="/admin"
						className="text-gray-300 transition hover:text-white"
					>
						Overview
					</Link>
					<Link
						href="/admin/categories"
						className="text-gray-300 transition hover:text-white"
					>
						Categories
					</Link>
					<Link
						href="/admin/internships"
						className="text-gray-300 transition hover:text-white"
					>
						Internships
					</Link>
				</div>
			</div>
			{children}
		</div>
	);
}
