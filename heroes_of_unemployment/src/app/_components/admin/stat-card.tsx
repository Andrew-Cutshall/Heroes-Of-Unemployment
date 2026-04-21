interface StatCardProps {
	label: string;
	value: number | string;
	icon: string;
}

export function StatCard({ label, value, icon }: StatCardProps) {
	return (
		<div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs font-medium uppercase text-gray-400">
						{label}
					</p>
					<p className="mt-2 text-3xl font-bold text-white">
						{typeof value === "number" ? value.toLocaleString() : value}
					</p>
				</div>
				<span className="text-4xl">{icon}</span>
			</div>
		</div>
	);
}
