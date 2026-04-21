import { CategoryAdminTable } from "H_o_R/app/_components/category-admin-table";

export default function CategoriesAdminPage() {
	return (
		<div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
			<h1 className="mb-4 text-xl font-bold text-white">Categories</h1>
			<p className="mb-4 text-sm text-gray-400">
				Organize internships into categories. Users can filter the feed by
				these categories.
			</p>
			<CategoryAdminTable />
		</div>
	);
}
