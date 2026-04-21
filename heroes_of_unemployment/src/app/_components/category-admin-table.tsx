"use client";

import { useState } from "react";
import { api } from "H_o_R/trpc/react";

export function CategoryAdminTable() {
	const listQuery = api.category.list.useQuery();
	const utils = api.useUtils();

	const invalidate = () => {
		void utils.category.list.invalidate();
		void utils.internship.getAll.invalidate();
		void utils.internship.adminList.invalidate();
	};

	const createMut = api.category.create.useMutation({ onSuccess: invalidate });
	const updateMut = api.category.update.useMutation({ onSuccess: invalidate });
	const deleteMut = api.category.delete.useMutation({ onSuccess: invalidate });

	const [newName, setNewName] = useState("");
	const [newSlug, setNewSlug] = useState("");
	const [newColor, setNewColor] = useState("#a855f7");

	const categories = listQuery.data ?? [];

	return (
		<div className="space-y-4">
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead className="text-xs uppercase text-gray-400">
						<tr>
							<th className="py-2">Name</th>
							<th>Slug</th>
							<th>Color</th>
							<th>Used by</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{categories.map((c) => (
							<tr key={c.id} className="border-t border-white/5">
								<td className="py-2">
									<input
										type="text"
										defaultValue={c.name}
										onBlur={(e) =>
											updateMut.mutate({ id: c.id, name: e.target.value })
										}
										className="rounded border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
									/>
								</td>
								<td>
									<input
										type="text"
										defaultValue={c.slug}
										onBlur={(e) =>
											updateMut.mutate({ id: c.id, slug: e.target.value })
										}
										className="rounded border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
									/>
								</td>
								<td>
									<input
										type="color"
										defaultValue={c.color}
										onBlur={(e) =>
											updateMut.mutate({ id: c.id, color: e.target.value })
										}
										className="h-8 w-14 cursor-pointer rounded border border-white/10 bg-transparent"
									/>
								</td>
								<td className="text-xs text-gray-400">—</td>
								<td>
									<button
										type="button"
										onClick={() => {
											if (confirm(`Delete category "${c.name}"?`)) {
												deleteMut.mutate({ id: c.id });
											}
										}}
										className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-300 transition hover:bg-red-500/30"
									>
										Delete
									</button>
								</td>
							</tr>
						))}
						<tr className="border-t border-white/10 bg-white/5">
							<td className="py-2">
								<input
									type="text"
									placeholder="Name"
									value={newName}
									onChange={(e) => setNewName(e.target.value)}
									className="rounded border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
								/>
							</td>
							<td>
								<input
									type="text"
									placeholder="slug"
									value={newSlug}
									onChange={(e) => setNewSlug(e.target.value)}
									className="rounded border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
								/>
							</td>
							<td>
								<input
									type="color"
									value={newColor}
									onChange={(e) => setNewColor(e.target.value)}
									className="h-8 w-14 cursor-pointer rounded border border-white/10 bg-transparent"
								/>
							</td>
							<td />
							<td>
								<button
									type="button"
									onClick={() => {
										if (!newName || !newSlug) return;
										createMut.mutate({
											name: newName,
											slug: newSlug,
											color: newColor,
										});
										setNewName("");
										setNewSlug("");
									}}
									className="rounded bg-purple-600 px-2 py-1 text-xs text-white transition hover:bg-purple-500"
								>
									Add
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			{(createMut.error || updateMut.error || deleteMut.error) && (
				<p className="text-xs text-red-400">
					{createMut.error?.message ??
						updateMut.error?.message ??
						deleteMut.error?.message}
				</p>
			)}
		</div>
	);
}
