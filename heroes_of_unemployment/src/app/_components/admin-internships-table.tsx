"use client";

import { useState } from "react";
import { api } from "H_o_R/trpc/react";

export function AdminInternshipsTable() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(0);
	const limit = 50;

	const listQuery = api.internship.adminList.useQuery({
		search: search || undefined,
		limit,
		offset: page * limit,
	});

	const utils = api.useUtils();
	const updateDeadline = api.internship.updateDeadline.useMutation({
		onSuccess: () => {
			void utils.internship.adminList.invalidate();
			void utils.internship.getAll.invalidate();
		},
	});
	const assign = api.category.assign.useMutation({
		onSuccess: () => {
			void utils.internship.adminList.invalidate();
			void utils.internship.getAll.invalidate();
		},
	});
	const categoriesQuery = api.category.list.useQuery();

	const items = listQuery.data?.items ?? [];
	const total = listQuery.data?.total ?? 0;

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<input
					type="text"
					placeholder="Search company or role..."
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
						setPage(0);
					}}
					className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500"
				/>
				<span className="text-sm text-gray-400">
					{total} internships
				</span>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead className="text-xs uppercase text-gray-400">
						<tr>
							<th className="py-2">Company</th>
							<th>Role</th>
							<th>Category</th>
							<th>Deadline</th>
						</tr>
					</thead>
					<tbody>
						{items.map((i) => (
							<tr key={i.id} className="border-t border-white/5">
								<td className="py-2 text-white">{i.company}</td>
								<td className="text-gray-300">{i.role}</td>
								<td>
									<select
										value={i.categoryId ?? ""}
										onChange={(e) =>
											assign.mutate({
												internshipId: i.id,
												categoryId: e.target.value || null,
											})
										}
										className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
									>
										<option value="">—</option>
										{(categoriesQuery.data ?? []).map((c) => (
											<option key={c.id} value={c.id}>
												{c.name}
											</option>
										))}
									</select>
								</td>
								<td>
									<input
										type="date"
										defaultValue={
											i.deadline
												? new Date(i.deadline).toISOString().slice(0, 10)
												: ""
										}
										onBlur={(e) => {
											const val = e.target.value
												? new Date(e.target.value)
												: null;
											updateDeadline.mutate({ id: i.id, deadline: val });
										}}
										className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="flex items-center justify-between pt-2">
				<button
					type="button"
					disabled={page === 0}
					onClick={() => setPage((p) => Math.max(0, p - 1))}
					className="rounded bg-white/10 px-3 py-1 text-xs text-white disabled:opacity-40"
				>
					Previous
				</button>
				<span className="text-xs text-gray-400">
					Page {page + 1} of {Math.max(1, Math.ceil(total / limit))}
				</span>
				<button
					type="button"
					disabled={(page + 1) * limit >= total}
					onClick={() => setPage((p) => p + 1)}
					className="rounded bg-white/10 px-3 py-1 text-xs text-white disabled:opacity-40"
				>
					Next
				</button>
			</div>
		</div>
	);
}
